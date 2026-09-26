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

    if (method === "JAZZCASH") {
      if (order.currency !== "PKR" && order.displayCurrency !== "PKR") {
        return NextResponse.json({ error: "JazzCash payments require a PKR order." }, { status: 400 });
      }
      const merchantId = process.env.JAZZCASH_MERCHANT_ID;
      const password = process.env.JAZZCASH_PASSWORD;
      const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
      if (!merchantId || !password || !integritySalt) {
        return NextResponse.json({ error: "JazzCash merchant credentials are not configured." }, { status: 503 });
      }
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
      if (!baseUrl) return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL or VERCEL_URL is required." }, { status: 503 });
      const txnRef = order.number.slice(0, 20);
      const txnDateTime = jazzCashTimestamp();
      const expiry = jazzCashTimestamp(new Date(Date.now() + 3 * 60 * 60 * 1000));
      const fields = {
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_Language: "EN",
        pp_MerchantID: merchantId,
        pp_SubMerchantID: "",
        pp_Password: password,
        pp_BankID: "",
        pp_ProductID: "RETL",
        pp_TxnRefNo: txnRef,
        pp_Amount: String(Math.round(Number(order.total) * 100)),
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: txnDateTime,
        pp_TxnExpiryDateTime: expiry,
        pp_BillReference: order.number.slice(0, 20),
        pp_Description: `MOTEVRA ${order.number}`.slice(0, 200),
        pp_ReturnURL: `${baseUrl}/api/payments/jazzcash/callback`,
        ppmpf_1: "", ppmpf_2: "", ppmpf_3: "", ppmpf_4: "", ppmpf_5: "",
      };
      const secureHash = createJazzCashSecureHash(fields, integritySalt);
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { providerTransactionId: txnRef, metadata: { source: "jazzcash", txnRef } },
      });
      return NextResponse.json({
        ok: true,
        provider: method,
        transactionId: transaction.id,
        status: "PENDING",
        action: "REDIRECT_FORM",
        gatewayUrl: process.env.JAZZCASH_PAYMENT_URL || "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform",
        fields: { ...fields, pp_SecureHash: secureHash },
      });
    }

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
