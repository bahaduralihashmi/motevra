import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";
export const runtime="nodejs";
const CART_COOKIE="motevra_cart";

async function getIdentity(){
  const session=await auth().catch(()=>null);
  if(session?.user?.email){
    const prisma=getPrisma();
    const user=await prisma.user.findUnique({where:{email:session.user.email},select:{id:true}});
    return {userId:user?.id??null, cartId:null};
  }
  const store=await cookies();
  return {userId:null,cartId:store.get(CART_COOKIE)?.value??null};
}
async function response(data:any,status=200,cartId?:string){
  const res=NextResponse.json(data,{status});
  if(cartId) res.cookies.set(CART_COOKIE,cartId,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
  return res;
}
export async function GET(){
  try{
    if(!process.env.DATABASE_URL) return response({error:"Cart database is not configured"},503);
    const prisma=getPrisma(); const id=await getIdentity();
    const cart=id.userId ? await prisma.cart.findFirst({where:{userId:id.userId,status:"ACTIVE"},include:{items:{include:{product:{include:{brand:true,tyre:{include:{size:true}}}}}}}})
      : id.cartId ? await prisma.cart.findFirst({where:{id:id.cartId,userId:null,status:"ACTIVE"},include:{items:{include:{product:{include:{brand:true,tyre:{include:{size:true}}}}}}}}) : null;
    return response({cart});
  }catch{return response({error:"Cart service temporarily unavailable"},503);}
}
export async function POST(req:NextRequest){
  try{
    if(!process.env.DATABASE_URL) return response({error:"Cart database is not configured"},503);
    const {productId,quantity}=await req.json(); const qty=Math.max(1,Math.floor(Number(quantity)||1)); const prisma=getPrisma(); const id=await getIdentity();
    const product=await prisma.product.findUnique({where:{id:productId}});
    if(!product||product.status!=="ACTIVE") return response({error:"Product unavailable"},404);
    if(qty>product.stock) return response({error:"Insufficient stock"},409);
    let cart=id.userId ? await prisma.cart.findFirst({where:{userId:id.userId,status:"ACTIVE"}}) : id.cartId ? await prisma.cart.findFirst({where:{id:id.cartId,userId:null,status:"ACTIVE"}}) : null;
    if(!cart) cart=await prisma.cart.create({data:{userId:id.userId,currency:product.currency}});
    const item=await prisma.cartItem.upsert({where:{cartId_productId:{cartId:cart.id,productId}},update:{quantity:qty,unitPrice:product.salePrice??product.price},create:{cartId:cart.id,productId,quantity:qty,unitPrice:product.salePrice??product.price}});
    return response({item},200,cart.id);
  }catch{return response({error:"Cart service temporarily unavailable"},503);}
}
export async function DELETE(req:NextRequest){
  try{
    if(!process.env.DATABASE_URL) return response({error:"Cart database is not configured"},503);
    const {productId}=await req.json(); const prisma=getPrisma(); const id=await getIdentity();
    const cart=id.userId ? await prisma.cart.findFirst({where:{userId:id.userId,status:"ACTIVE"}}) : id.cartId ? await prisma.cart.findFirst({where:{id:id.cartId,userId:null,status:"ACTIVE"}}) : null;
    if(cart) await prisma.cartItem.deleteMany({where:{cartId:cart.id,productId}});
    return response({ok:true});
  }catch{return response({error:"Cart service temporarily unavailable"},503);}
}