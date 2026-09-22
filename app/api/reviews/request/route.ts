import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { createReviewRequest } from "@/lib/reviews";
export const runtime="nodejs";
export async function POST(req:NextRequest){
  if(!await getAdminUser())return NextResponse.json({error:"Admin access required."},{status:403});
  const b=await req.json(),orderId=String(b.orderId||"");
  if(!orderId)return NextResponse.json({error:"orderId is required."},{status:400});
  const p=getPrisma(),order=await p.order.findUnique({where:{id:orderId},include:{items:{include:{product:true}},user:{select:{email:true,name:true}}}});
  if(!order||order.status!=="DELIVERED")return NextResponse.json({error:"Review requests can only be sent for delivered orders."},{status:400});
  const email=order.user?.email||order.guestEmail;
  if(!email)return NextResponse.json({error:"No customer email is available for this order."},{status:400});
  const results=await Promise.all(order.items.map(i=>createReviewRequest(order.id,i.productId,email,order.user?.name||order.guestName)));
  return NextResponse.json({sent:results.filter(x=>x.result.sent).length,total:results.length,configured:results.every(x=>x.result.sent)});
}
