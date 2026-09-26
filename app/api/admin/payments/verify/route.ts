import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { markPaymentSucceeded } from "@/lib/payments/mark-paid";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const orderId = String(body.orderId || "").trim();
    const transactionId = String(body.paymentTransactionId || "").trim() || undefined;
    const providerTransactionId = String(body.providerTransactionId || "").trim() || undefined;

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

    const prisma = getPrisma();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { paymentTransactions: { orderBy: { createdAt: "desc" } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const transaction = transactionId
      ? order.paymentTransactions.find((item) => item.id === transactionId)
      : order.paymentTransactions.find((item) => item.status !== "SUCCEEDED") || order.paymentTransactions[0];

    if (!transaction) {
      return NextResponse.json({ error: "Payment transaction not found." }, { status: 404 });
    }

    if (transaction.provider !== "BANK_TRANSFER" && transaction.provider !== "COD" && transaction.provider !== "RAAST") {
      return NextResponse.json(
        { error: "This endpoint only verifies bank transfer or collected COD payments." },
        { status: 400 },
      );
    }

    const result = await markPaymentSucceeded({
      orderId,
      paymentTransactionId: transaction.id,
      providerTransactionId,
      metadata: {
        verifiedBy: "admin",
        verifiedAt: new Date().toISOString(),
        provider: transaction.provider,
      },
    });

    return NextResponse.json({
      ok: true,
      message: transaction.provider === "COD" ? "COD payment marked collected." : transaction.provider === "RAAST" ? "Raast payment marked verified." : "Bank transfer marked verified.",
      ...result,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to verify payment." },
      { status: 500 },
    );
  }
}
