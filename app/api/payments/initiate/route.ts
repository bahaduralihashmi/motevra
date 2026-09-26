import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import {
  getAvailablePaymentMethods,
  isPaymentMethodAllowed,
  normalizePaymentMethod,
} from "@/lib/payments/payment-methods";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const country = String(new URL(req.url).searchParams.get("country") || "PK").toUpperCase();
  return NextResponse.json({ country, methods: getAvailablePaymentMethods(country) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth().catch(() => null);
    const body = await req.json();
    const orderId = String(body.orderId || "").trim();
    const method = normalizePaymentMethod(body.paymentMethod);
    if (!orderId || !method) {
      return NextResponse.json({ error: "orderId and a valid payment method are required." }, { status: 400 });
    }

    const prisma = getPrisma();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { paymentTransactions: { orderBy: { createdAt: "desc" } } },
    });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
      if (user && order.userId !== user.id) {
        return NextResponse.json({ error: "You cannot access this order." }, { status: 403 });
      }
    } else if (!order.userId && body.email && order.guestEmail !== String(body.email).trim()) {
      return NextResponse.json({ error: "Order verification failed." }, { status: 403 });
    }

    if (!isPaymentMethodAllowed(method, order.shippingCountry)) {
      return NextResponse.json({ error: "This payment method is not available for the destination country." }, { status: 400 });
    }

    const transaction = order.paymentTransactions.find(
      (item) => item.status !== "SUCCEEDED" && item.provider === method,
    ) || await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: method,
        status: "PENDING",
        amount: order.total,
        currency: order.displayCurrency || order.currency,
        baseAmount: order.baseTotal,
        baseCurrency: order.baseCurrency,
        exchangeRate: order.exchangeRate,
        metadata: { source: "payment-initiation" },
      },
    });

    if (method === "BANK_TRANSFER" || method === "COD") {
      return NextResponse.json({
        ok: true,
        provider: method,
        transactionId: transaction.id,
        status: "PENDING",
        action: method === "COD" ? "COLLECTION" : "BANK_TRANSFER_INSTRUCTIONS",
        message: method === "COD"
          ? "Order placed with Pakistan cash on delivery. Payment remains pending until collection is verified."
          : "Bank transfer payment remains pending until the transfer is verified by MOTEVRA.",
      });
    }

    return NextResponse.json({
      ok: true,
      provider: method,
      transactionId: transaction.id,
      status: "PENDING",
      action: "PROVIDER_CONFIGURATION_REQUIRED",
      message: method + " is routed correctly, but merchant credentials and signed provider callbacks must be configured before live payment processing is enabled.",
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json({ error: "Unable to initialize payment." }, { status: 500 });
  }
}
