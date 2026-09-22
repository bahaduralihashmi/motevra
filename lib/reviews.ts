import { getPrisma } from "@/lib/prisma";

export async function sendReviewRequestEmail(args:{email:string;name?:string|null;productName:string;token:string}) {
  const key=process.env.RESEND_API_KEY;
  const from=process.env.EMAIL_FROM;
  if(!key||!from) return {sent:false,reason:"Email service is not configured."};
  const url=`${process.env.NEXT_PUBLIC_SITE_URL||"https://www.motevra.com"}/review/${args.token}`;
  const html=`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto"><h2>MOTEVRA</h2><p>Hi ${args.name||"there"},</p><p>Your order has been delivered. How was your <strong>${args.productName}</strong>?</p><p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none">Review your product</a></p><p>Thank you for shopping with MOTEVRA.</p></div>`;
  const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({from,to:[args.email],subject:`How was your ${args.productName}?`,html})});
  if(!r.ok) return {sent:false,reason:await r.text()};
  return {sent:true};
}

export async function createReviewRequest(orderId:string,productId:string,email:string,name?:string|null){
  const p=getPrisma();
  const token=crypto.randomUUID().replaceAll("-","")+crypto.randomUUID().replaceAll("-","");
  const request=await p.reviewRequest.upsert({where:{orderId_productId:{orderId,productId}},update:{token,expiresAt:new Date(Date.now()+30*24*60*60*1000),usedAt:null,email},create:{token,orderId,productId,email,expiresAt:new Date(Date.now()+30*24*60*60*1000)}});
  const product=await p.product.findUnique({where:{id:productId},select:{name:true}});
  const result=product?await sendReviewRequestEmail({email,name,productName:product.name,token}):{sent:false,reason:"Product not found."};
  return {request,result};
}
