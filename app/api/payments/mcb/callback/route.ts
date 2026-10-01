import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { decryptCredentials } from "@/lib/supplier-credentials";
import { mcbGetOrder } from "@/lib/payments/mcb";
import { markPaymentSucceeded } from "@/lib/payments/mark-paid";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const transactionId = String(u.searchParams.get("transaction") || "");
    if (!transactionId) return new NextResponse("Missing payment transaction.", { status: 400 });

    const prisma = getPrisma();
    const tx = await prisma.paymentTransaction.findUnique({ where: { id: transactionId }, include: { order: true } });
    if (!tx || tx.provider !== "MCB_EGATE") return new NextResponse("Payment transaction not found.", { status: 404 });

    const meta = tx.metadata && typeof tx.metadata === "object" ? tx.metadata as Record<string, unknown> : {};
    const config = await prisma.paymentMethodConfig.findUnique({ where: { id: String(meta.paymentMethodConfigId || "") } });
    const credentials = config?.encryptedCredentials ? decryptCredentials<Record<string,string>>(config.encryptedCredentials) : {};
    const settings = config?.settings && typeof config.settings === "object" ? config.settings as Record<string,unknown> : {};
    const merchantId = String(credentials.merchantId || "").trim();
    const password = String(credentials.apiPassword || credentials.password || "").trim();
    const base = String(settings.apiBaseUrl || "").replace(/\/$/,"");
    const version = String(settings.apiVersion || "61");
    if (!merchantId || !password || !base) return new NextResponse("MCB eGate is not configured.", { status: 503 });

    const result = await mcbGetOrder(base, version, merchantId, password, tx.order.number);
    const status = String(result.status || "").toUpperCase();
    const resultCode = String(result.result || "").toUpperCase();
    const amount = Number(result.totalAuthorizedAmount ?? result.totalCapturedAmount ?? result.order?.amount ?? NaN);
    const currency = String(result.currency || result.order?.currency || "").toUpperCase();
    const amountOk = Number.isFinite(amount) && Math.abs(amount - Number(tx.amount)) < 0.01;
    const currencyOk = !currency || currency === tx.currency.toUpperCase();
    const paid = resultCode === "SUCCESS" && status === "CAPTURED" && amountOk && currencyOk;

    if (paid) {
      await markPaymentSucceeded({
        orderId: tx.orderId,
        paymentTransactionId: tx.id,
        providerTransactionId: String(result.transaction?.id || meta.mcbSessionId || tx.providerTransactionId || tx.id),
        rawResponse: result,
        metadata: { provider: "MCB_EGATE", verified: true, status, result: resultCode },
      });
    } else if (["FAILURE","ERROR","DECLINED"].includes(resultCode) || ["FAILED","DECLINED","CANCELLED"].includes(status)) {
      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: { status: "FAILED", rawResponse: result, metadata: { provider: "MCB_EGATE", status, result: resultCode } },
      });
    }

    const out = new URL("/order-success", u.origin);
    out.searchParams.set("number", tx.order.number);
    out.searchParams.set("payment", paid ? "success" : "failed");
    return NextResponse.redirect(out, 303);
  } catch (error) {
    console.error("MCB callback error:", error);
    return new NextResponse("Unable to verify MCB eGate payment.", { status: 500 });
  }
}
