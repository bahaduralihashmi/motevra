import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { markPaymentSucceeded } from "@/lib/payments/mark-paid";
import { verifyJazzCashSecureHash } from "@/lib/payments/jazzcash";

export const runtime = "nodejs";

function toFields(form: FormData) {
  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") fields[key] = value;
  }
  return fields;
}

export async function POST(req: NextRequest) {
  try {
    const fields = toFields(await req.formData());
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;
    if (!integritySalt) return new NextResponse("Payment configuration error.", { status: 503 });

    const receivedHash = fields.pp_SecureHash || "";
    if (!receivedHash || !verifyJazzCashSecureHash(fields, integritySalt, receivedHash)) {
      return new NextResponse("Invalid payment signature.", { status: 400 });
    }

    const txnRef = String(fields.pp_TxnRefNo || "").trim();
    const responseCode = String(fields.pp_ResponseCode || fields.ResponseCode || "").trim();
    const responseMessage = String(fields.pp_ResponseMessage || fields.ResponseMessage || "").trim();
    if (!txnRef) return new NextResponse("Missing transaction reference.", { status: 400 });

    const prisma = getPrisma();
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { provider: "JAZZCASH", providerTransactionId: txnRef },
      include: { order: true },
    });

    if (!transaction) return new NextResponse("Transaction not found.", { status: 404 });

    const expectedAmount = Math.round(Number(transaction.amount) * 100);
    const returnedAmount = Number(String(fields.pp_Amount || "").replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(returnedAmount) || returnedAmount !== expectedAmount) {
      return new NextResponse("Payment amount mismatch.", { status: 400 });
    }

    if (String(fields.pp_TxnCurrency || "PKR").toUpperCase() !== "PKR") {
      return new NextResponse("Payment currency mismatch.", { status: 400 });
    }

    const success = responseCode === "000";
    if (success) {
      await markPaymentSucceeded({
        orderId: transaction.orderId,
        paymentTransactionId: transaction.id,
        providerTransactionId: txnRef,
        rawResponse: fields,
        metadata: {
          provider: "JAZZCASH",
          responseCode,
          responseMessage,
          retrievalReferenceNo: fields.pp_RetreivalReferenceNo || null,
        },
      });
    } else {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: "FAILED",
          rawResponse: fields,
          metadata: { provider: "JAZZCASH", responseCode, responseMessage },
        },
      });
    }

    const redirect = new URL("/order-success", req.url);
    redirect.searchParams.set("number", transaction.order.number);
    redirect.searchParams.set("payment", success ? "success" : "failed");
    return NextResponse.redirect(redirect, 303);
  } catch (error) {
    console.error("JazzCash callback error:", error);
    return new NextResponse("Unable to process payment callback.", { status: 500 });
  }
}
