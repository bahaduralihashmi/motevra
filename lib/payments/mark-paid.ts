import { getPrisma } from "@/lib/prisma";

export async function triggerPaidOrderFulfillment(orderId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);

  if (!baseUrl) {
    return { ok: false, error: "NEXT_PUBLIC_APP_URL or VERCEL_URL is not configured." };
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return { ok: false, error: "CRON_SECRET is not configured." };
  }

  try {
    const response = await fetch(`${baseUrl}/api/admin/orders/cj-fulfill`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ orderId }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Fulfillment request failed.",
    };
  }
}

export async function markPaymentSucceeded(input: {
  orderId: string;
  paymentTransactionId?: string;
  providerTransactionId?: string;
  providerPaymentIntentId?: string;
  rawResponse?: unknown;
  metadata?: Record<string, unknown>;
}) {
  const prisma = getPrisma();

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      include: { paymentTransactions: { orderBy: { createdAt: "desc" } } },
    });

    if (!order) throw new Error("Order not found.");

    const transaction = input.paymentTransactionId
      ? await tx.paymentTransaction.findUnique({ where: { id: input.paymentTransactionId } })
      : order.paymentTransactions.find((item) => item.status !== "SUCCEEDED") ||
        order.paymentTransactions[0];

    if (!transaction) throw new Error("Payment transaction not found.");
    if (transaction.orderId !== order.id) throw new Error("Payment transaction does not belong to this order.");

    if (transaction.status === "SUCCEEDED" && order.paymentStatus === "PAID") {
      return { orderId: order.id, transactionId: transaction.id, alreadyPaid: true };
    }

    const updatedTransaction = await tx.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "SUCCEEDED",
        providerTransactionId: input.providerTransactionId ?? transaction.providerTransactionId,
        providerPaymentIntentId: input.providerPaymentIntentId ?? transaction.providerPaymentIntentId,
        rawResponse: input.rawResponse === undefined ? transaction.rawResponse : input.rawResponse as any,
        metadata: input.metadata === undefined ? transaction.metadata : input.metadata as any,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
      },
    });

    const existingSale = await tx.commissionLedger.findFirst({
      where: { orderId: order.id, type: "SALE", referenceId: transaction.id },
      select: { id: true },
    });

    if (!existingSale) {
      await tx.commissionLedger.create({
        data: {
          orderId: order.id,
          type: "SALE",
          amount: Number(order.total),
          currency: order.displayCurrency || order.currency,
          description: `Customer payment ${transaction.provider}`,
          referenceId: transaction.id,
        },
      });
    }

    return {
      orderId: order.id,
      transactionId: updatedTransaction.id,
      alreadyPaid: false,
    };
  });

  if (result.alreadyPaid) return { ...result, fulfillment: null };

  const fulfillment = await triggerPaidOrderFulfillment(result.orderId);
  return { ...result, fulfillment };
}
