import { NextRequest,NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
export const runtime="nodejs";
export async function POST(req:NextRequest){
 const b=await req.json(),token=String(b.token||""),productId=String(b.productId||""),rating=Number(b.rating),comment=String(b.comment||"").trim(),title=String(b.title||"").trim()||null;
 if(!token||!productId||!Number.isInteger(rating)||rating<1||rating>5||comment.length<5)return NextResponse.json({error:"Valid rating and feedback are required."},{status:400});
 const p=getPrisma(),rr=await p.reviewRequest.findUnique({where:{token}});
 if(!rr||rr.productId!==productId||rr.usedAt||rr.expiresAt<new Date())return NextResponse.json({error:"This review link is invalid or expired."},{status:410});
 const existing=await p.review.findUnique({where:{orderId_productId:{orderId:rr.orderId,productId}}});
 if(existing)return NextResponse.json({error:"This purchase has already been reviewed."},{status:409});
 const review=await p.$transaction(async tx=>{const r=await tx.review.create({data:{productId,orderId:rr.orderId,rating,title,comment,status:"PENDING",verifiedPurchase:true}});await tx.reviewRequest.update({where:{id:rr.id},data:{usedAt:new Date()}});return r});
 return NextResponse.json({review},{status:201});
}
