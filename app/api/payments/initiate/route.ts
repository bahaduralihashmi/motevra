import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { createJazzCashSecureHash, jazzCashTimestamp } from "@/lib/payments/jazzcash";
import { decryptCredentials } from "@/lib/supplier-credentials";
import { getEnabledPaymentMethods } from "@/lib/payment-method-config";
import { paypalAccessToken, paypalRequest } from "@/lib/payments/paypal";
import { stripeRequest } from "@/lib/payments/stripe";
import { mcbCreateSession } from "@/lib/payments/mcb";
import { easypaisaExpiry, easypaisaNonce, createEasypaisaMerchantHash } from "@/lib/payments/easypaisa";
import {
  isPaymentMethodAllowed,
  normalizePaymentMethod,
} from "@/lib/payments/payment-methods";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const country = String(new URL(req.url).searchParams.get("country") || "PK").toUpperCase();
  const currency = String(new URL(req.url).searchParams.get("currency") || "PKR").toUpperCase();
  return NextResponse.json({ country, currency, methods: await getEnabledPaymentMethods(country, currency) });
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
      const config = await prisma.paymentMethodConfig.findFirst({
        where: {
          provider: "JAZZCASH",
          enabled: true,
          countries: { has: order.shippingCountry },
          OR: [{ currencies: { has: "PKR" } }, { currencies: { isEmpty: true } }],
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      if (!config || !config.encryptedCredentials) {
        return NextResponse.json({ error: "JazzCash is not configured in the Admin Payment Dashboard." }, { status: 503 });
      }
      const credentials = decryptCredentials<Record<string, string>>(config.encryptedCredentials);
      const merchantId = String(credentials.merchantId || credentials.MerchantID || "").trim();
      const password = String(credentials.password || credentials.Password || "").trim();
      const integritySalt = String(credentials.integritySalt || credentials.sharedSecret || "").trim();
      if (!merchantId || !password || !integritySalt) {
        return NextResponse.json({ error: "JazzCash merchantId, password and integritySalt are required in the Admin Payment Dashboard." }, { status: 503 });
      }
      const settings = config.settings && typeof config.settings === "object" ? config.settings as Record<string, unknown> : {};
      const configuredGatewayUrl = String(settings.gatewayUrl || "").trim();
      if (!configuredGatewayUrl) {
        return NextResponse.json({ error: "JazzCash gateway URL is missing in the Admin Payment Dashboard." }, { status: 503 });
      }
      const txnRef = order.number.slice(0, 20);
      const txnDateTime = jazzCashTimestamp();
      const expiry = jazzCashTimestamp(new Date(Date.now() + 3 * 60 * 60 * 1000));
      const baseUrl = new URL(req.url).origin;
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
        data: { providerTransactionId: txnRef, metadata: { source: "jazzcash", txnRef, paymentMethodConfigId: config.id } },
      });
      return NextResponse.json({
        ok: true,
        provider: method,
        transactionId: transaction.id,
        status: "PENDING",
        action: "REDIRECT_FORM",
        gatewayUrl: configuredGatewayUrl,
        fields: { ...fields, pp_SecureHash: secureHash },
      });
    }
    if (method === "EASYPAISA") {
      if ((order.currency || order.displayCurrency) !== "PKR" && order.displayCurrency !== "PKR") {
        return NextResponse.json({ error: "Easypaisa payments require a PKR order." }, { status: 400 });
      }
      const config = await prisma.paymentMethodConfig.findFirst({
        where: {
          provider: "EASYPAISA",
          enabled: true,
          countries: { has: order.shippingCountry },
          OR: [{ currencies: { has: "PKR" } }, { currencies: { isEmpty: true } }],
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      });
      if (!config || !config.encryptedCredentials) {
        return NextResponse.json({ error: "Easypaisa is not configured in the Admin Payment Dashboard." }, { status: 503 });
      }
      const credentials = decryptCredentials<Record<string, string>>(config.encryptedCredentials);
      const storeId = String(credentials.storeId || credentials.StoreID || credentials.store_id || "").trim();
      const hashKey = String(credentials.hashKey || credentials.HashKey || credentials.hash_key || "").trim();
      if (!storeId) {
        return NextResponse.json({ error: "Easypaisa storeId is required in the Admin Payment Dashboard." }, { status: 503 });
      }
      const settings = config.settings && typeof config.settings === "object" ? config.settings as Record<string, unknown> : {};
      const gatewayUrl = String(settings.gatewayUrl || "").trim();
      const confirmUrl = String(settings.confirmUrl || "").trim();
      if (!gatewayUrl || !confirmUrl) {
        return NextResponse.json({ error: "Easypaisa gateway URL and confirmation URL are required in the Admin Payment Dashboard." }, { status: 503 });
      }
      const existingMeta = transaction.metadata && typeof transaction.metadata === "object" ? transaction.metadata as Record<string, unknown> : {};
      const orderRefNum = String(existingMeta.easypaisaOrderRef || `EP${order.id.replace(/[^A-Za-z0-9]/g, "").slice(-18)}`).slice(0, 20);
      const nonce = String(existingMeta.easypaisaNonce || easypaisaNonce());
      const callbackUrl = new URL("/api/payments/easypaisa/callback", new URL(req.url).origin);
      callbackUrl.searchParams.set("nonce", nonce);
      const fields: Record<string,string> = {
        amount: Number(order.total).toFixed(1),
        storeId,
        postBackURL: callbackUrl.toString(),
        orderRefNum,
        expiryDate: easypaisaExpiry(30),
        autoRedirect: "0",
        paymentMethod: "MA_PAYMENT_METHOD",
      };
      if (body.email) fields.emailAddr = String(body.email).trim();
      if (body.mobile || body.phone) fields.mobileNum = String(body.mobile || body.phone).trim();
      if (hashKey) fields.merchantHashedReq = createEasypaisaMerchantHash(fields, hashKey);
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          providerTransactionId: orderRefNum,
          metadata: { source: "easypaisa", paymentMethodConfigId: config.id, easypaisaOrderRef: orderRefNum, easypaisaNonce: nonce },
        },
      });
      return NextResponse.json({
        ok: true,
        provider: method,
        transactionId: transaction.id,
        status: "PENDING",
        action: "REDIRECT_FORM",
        gatewayUrl,
        fields,
      });
    }
    if (method === "STRIPE") {
      const config=await prisma.paymentMethodConfig.findFirst({where:{provider:"STRIPE",enabled:true,countries:{has:order.shippingCountry}},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]});
      const cr=config?.encryptedCredentials?decryptCredentials<Record<string,string>>(config.encryptedCredentials):{};
      if(!config||!cr.secretKey)return NextResponse.json({error:"Stripe is not configured in the Admin Payment Dashboard."},{status:503});
      const meta=config.settings&&typeof config.settings==="object"?config.settings as Record<string,unknown>:{};
      const origin=new URL(req.url).origin,success=String(meta.successUrl||origin+"/api/payments/stripe/callback?session_id={CHECKOUT_SESSION_ID}"),cancel=String(meta.cancelUrl||origin+"/order-success?payment=cancelled");
      const form=new URLSearchParams();form.set("mode","payment");form.set("success_url",success);form.set("cancel_url",cancel);form.set("client_reference_id",order.id);form.set("metadata[order_id]",order.id);form.set("metadata[payment_transaction_id]",transaction.id);form.set("line_items[0][price_data][currency]",order.displayCurrency.toLowerCase());form.set("line_items[0][price_data][product_data][name]","MOTEVRA Order "+order.number);form.set("line_items[0][price_data][unit_amount]",String(Math.round(Number(order.total)*100)));form.set("line_items[0][quantity]","1");
      const s=await stripeRequest(cr.secretKey,"/v1/checkout/sessions",form);if(!s.url||!s.id)throw new Error("Stripe did not return a checkout URL.");await prisma.paymentTransaction.update({where:{id:transaction.id},data:{providerTransactionId:s.id,metadata:{source:"stripe",paymentMethodConfigId:config.id}}});return NextResponse.json({ok:true,provider:method,transactionId:transaction.id,status:"PENDING",action:"REDIRECT_URL",url:s.url});
    }
    if (method === "PAYPAL") {
      const config=await prisma.paymentMethodConfig.findFirst({where:{provider:"PAYPAL",enabled:true,countries:{has:order.shippingCountry}},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]});
      const cr=config?.encryptedCredentials?decryptCredentials<Record<string,string>>(config.encryptedCredentials):{};const meta=config?.settings&&typeof config.settings==="object"?config.settings as Record<string,unknown>:{};
      if(!config||!cr.clientId||!cr.clientSecret)return NextResponse.json({error:"PayPal is not configured in the Admin Payment Dashboard."},{status:503});
      const base=String(meta.apiBaseUrl||"https://api-m.paypal.com").replace(/\/$/,"");const token=await paypalAccessToken(base,cr.clientId,cr.clientSecret);const origin=new URL(req.url).origin;const body={intent:"CAPTURE",purchase_units:[{reference_id:order.number,custom_id:order.id,amount:{currency_code:order.displayCurrency,value:Number(order.total).toFixed(2)}}],application_context:{return_url:String(meta.successUrl||origin+"/api/payments/paypal/callback"),cancel_url:String(meta.cancelUrl||origin+"/order-success?payment=cancelled")}};const po=await paypalRequest(base,token,"/v2/checkout/orders",{method:"POST",headers:{"PayPal-Request-Id":transaction.id},body:JSON.stringify(body)});const approve=po.links?.find((x:any)=>x.rel==="approve")?.href;if(!approve)throw new Error("PayPal did not return an approval URL.");await prisma.paymentTransaction.update({where:{id:transaction.id},data:{providerTransactionId:po.id,metadata:{source:"paypal",paymentMethodConfigId:config.id}}});return NextResponse.json({ok:true,provider:method,transactionId:transaction.id,status:"PENDING",action:"REDIRECT_URL",url:approve});
    }
    if (method === "MCB_EGATE") {
      const config=await prisma.paymentMethodConfig.findFirst({where:{provider:"MCB_EGATE",enabled:true,countries:{has:order.shippingCountry}},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]});
      const cr=config?.encryptedCredentials?decryptCredentials<Record<string,string>>(config.encryptedCredentials):{};const meta=config?.settings&&typeof config.settings==="object"?config.settings as Record<string,unknown>:{};
      const merchantId=String(cr.merchantId||"").trim(),password=String(cr.apiPassword||cr.password||"").trim(),base=String(meta.apiBaseUrl||"").replace(/\/$/,""),version=String(meta.apiVersion||"61"),js=String(meta.checkoutJsUrl||"");
      if(!config||!merchantId||!password||!base||!js)return NextResponse.json({error:"MCB eGate is not configured in the Admin Payment Dashboard."},{status:503});
      const origin=new URL(req.url).origin;const session=await mcbCreateSession(base,version,merchantId,password,{apiOperation:"CREATE_CHECKOUT_SESSION",order:{id:order.number,amount:Number(order.total).toFixed(2),currency:order.displayCurrency},interaction:{operation:"PURCHASE",returnUrl:origin+"/api/payments/mcb/callback?transaction="+encodeURIComponent(transaction.id)}});
      await prisma.paymentTransaction.update({where:{id:transaction.id},data:{providerTransactionId:session.session.id,metadata:{source:"mcb_egate",paymentMethodConfigId:config.id,mcbSessionId:session.session.id}}});
      return NextResponse.json({ok:true,provider:method,transactionId:transaction.id,status:"PENDING",action:"REDIRECT_URL",url:origin+"/api/payments/mcb/checkout?session="+encodeURIComponent(session.session.id)+"&config="+encodeURIComponent(config.id)});
    }
    if (method === "RAAST") {
      const config=await prisma.paymentMethodConfig.findFirst({where:{provider:"RAAST",enabled:true,countries:{has:"PK"},currencies:{has:"PKR"}},orderBy:[{sortOrder:"asc"},{createdAt:"asc"}]});
      if(!config)return NextResponse.json({error:"Raast is not configured in the Admin Payment Dashboard."},{status:503});
      const meta=config.settings&&typeof config.settings==="object"?config.settings as Record<string,unknown>:{};
      return NextResponse.json({ok:true,provider:method,transactionId:transaction.id,status:"PENDING",action:"RAAST_INSTRUCTIONS",instructions:config.instructions||"Complete the Raast payment using the configured merchant alias, IBAN or QR code. MOTEVRA will verify the payment before fulfillment.",merchantAlias:String(meta.merchantAlias||""),iban:String(meta.iban||""),qrImageUrl:String(meta.qrImageUrl||"")});
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
