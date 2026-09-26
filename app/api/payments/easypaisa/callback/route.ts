import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { markPaymentSucceeded } from "@/lib/payments/mark-paid";
import { decryptCredentials } from "@/lib/supplier-credentials";

export const runtime="nodejs";

function htmlForm(action:string,fields:Record<string,string>){
  const inputs=Object.entries(fields).map(([k,v])=>`<input type="hidden" name="${k.replace(/&/g,"&amp;").replace(/"/g,"&quot;")}" value="${String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;")}">`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>MOTEVRA Payment</title></head><body><p>Connecting to Easypaisa…</p><form id="payment" method="POST" action="${action}">${inputs}</form><script>document.getElementById("payment").submit()</script></body></html>`;
}

export async function GET(req:NextRequest){
  try{
    const url=new URL(req.url);
    const nonce=String(url.searchParams.get("nonce")||"");
    const authToken=String(url.searchParams.get("auth_token")||"");
    const status=String(url.searchParams.get("status")||"").trim();
    const desc=String(url.searchParams.get("desc")||"").trim();
    const orderRef=String(url.searchParams.get("orderRefNumber")||url.searchParams.get("orderRefNum")||"").trim();

    if(!nonce) return new NextResponse("Missing payment session.",{status:400});
    const prisma=getPrisma();

    if(authToken){
      const candidates=await prisma.paymentTransaction.findMany({
        where:{provider:"EASYPAISA",status:"PENDING"},
        include:{order:true},
        orderBy:{createdAt:"desc"},
        take:25,
      });
      const candidate=candidates.find(item=>{
        const meta=item.metadata&&typeof item.metadata==="object"?item.metadata as Record<string,unknown>:{};
        return String(meta.easypaisaNonce||"")===nonce;
      });
      if(!candidate) return new NextResponse("Transaction not found.",{status:404});
      const meta=candidate.metadata&&typeof candidate.metadata==="object"?candidate.metadata as Record<string,unknown>:{};
      const configId=String(meta.paymentMethodConfigId||"");
      const config=configId?await prisma.paymentMethodConfig.findUnique({where:{id:configId}}):null;
      if(!config?.settings||typeof config.settings!=="object") return new NextResponse("Easypaisa configuration not found.",{status:503});
      const settings=config.settings as Record<string,unknown>;
      const confirmUrl=String(settings.confirmUrl||"").trim();
      if(!confirmUrl) return new NextResponse("Easypaisa confirmation URL is not configured.",{status:503});
      const callback=new URL("/api/payments/easypaisa/callback",url.origin);
      callback.searchParams.set("nonce",nonce);
      return new NextResponse(htmlForm(confirmUrl,{auth_token:authToken,postBackURL:callback.toString()}),{headers:{"Content-Type":"text/html; charset=utf-8"}});
    }

    if(!status||!orderRef) return new NextResponse("Waiting for Easypaisa confirmation.",{status:400});

    const transaction=await prisma.paymentTransaction.findFirst({
      where:{provider:"EASYPAISA",providerTransactionId:orderRef},
      include:{order:true},
    });
    if(!transaction) return new NextResponse("Transaction not found.",{status:404});
    const meta=transaction.metadata&&typeof transaction.metadata==="object"?transaction.metadata as Record<string,unknown>:{};
    if(String(meta.easypaisaNonce||"")!==nonce) return new NextResponse("Payment session mismatch.",{status:400});

    const success=desc==="0000"&&status.toLowerCase()==="success";
    if(success){
      await markPaymentSucceeded({
        orderId:transaction.orderId,
        paymentTransactionId:transaction.id,
        providerTransactionId:orderRef,
        rawResponse:Object.fromEntries(url.searchParams.entries()),
        metadata:{provider:"EASYPAISA",status,desc,orderRefNumber:orderRef},
      });
    }else{
      await prisma.paymentTransaction.update({
        where:{id:transaction.id},
        data:{status:"FAILED",rawResponse:Object.fromEntries(url.searchParams.entries()),metadata:{provider:"EASYPAISA",status,desc,orderRefNumber:orderRef}},
      });
    }

    const redirect=new URL("/order-success",url.origin);
    redirect.searchParams.set("number",transaction.order.number);
    redirect.searchParams.set("payment",success?"success":"failed");
    return NextResponse.redirect(redirect,303);
  }catch(error){
    console.error("Easypaisa callback error:",error);
    return new NextResponse("Unable to process Easypaisa callback.",{status:500});
  }
}

export async function POST(req:NextRequest){
  const url=new URL(req.url);
  const form=await req.formData();
  const query=new URLSearchParams();
  for(const [k,v] of form.entries()) if(typeof v==="string") query.set(k,v);
  url.search= query.toString();
  return GET(new NextRequest(url,{method:"GET"}));
}
