import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
export const runtime="nodejs";

export async function GET(req:NextRequest){
  const productId=req.nextUrl.searchParams.get("productId");
  if(!productId)return NextResponse.json({error:"productId is required."},{status:400});
  const reviews=await getPrisma().review.findMany({where:{productId,status:"APPROVED"},orderBy:{createdAt:"desc"},include:{user:{select:{name:true,image:true}}}});
  const rating=reviews.length?reviews.reduce((s,r)=>s+r.rating,0)/reviews.length:0;
  return NextResponse.json({reviews,rating,count:reviews.length});
}

export async function POST(req:NextRequest){
  const s=await auth().catch(()=>null);
  if(!s?.user?.email)return NextResponse.json({error:"Sign in required to submit a review."},{status:401});
  const b=await req.json(),productId=String(b.productId||""),rating=Number(b.rating),comment=String(b.comment||"").trim(),title=String(b.title||"").trim()||null;
  if(!productId||rating<1||rating>5||!Number.isInteger(rating)||comment.length<5)return NextResponse.json({error:"Product, 1–5 rating and at least 5 characters of feedback are required."},{status:400});
  const p=getPrisma(),u=await p.user.findUnique({where:{email:s.user.email},select:{id:true}});
  if(!u)return NextResponse.json({error:"Account not found."},{status:404});
  const item=await p.orderItem.findFirst({where:{productId,order:{userId:u.id,status:"DELIVERED"}},include:{order:true}});
  if(!item)return NextResponse.json({error:"Only customers with a delivered purchase can review this product."},{status:403});
  const existing=await p.review.findUnique({where:{orderId_productId:{orderId:item.orderId,productId}}});
  if(existing)return NextResponse.json({error:"You already reviewed this purchase."},{status:409});
  const review=await p.review.create({data:{productId,userId:u.id,orderId:item.orderId,rating,title,comment,images:Array.isArray(b.images)?b.images:undefined,status:"PENDING",verifiedPurchase:true}});
  return NextResponse.json({review},{status:201});
}
