import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";
export const runtime="nodejs";
const CART_COOKIE="motevra_cart";
let cartSchemaReady=false;
async function ensureCartVariantSchema(){
  if(cartSchemaReady) return;
  const prisma=getPrisma();
  await prisma.$executeRawUnsafe('ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "variantId" TEXT');
  await prisma.$executeRawUnsafe('ALTER TABLE "CartItem" DROP CONSTRAINT IF EXISTS "CartItem_cartId_productId_key"');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "CartItem_variantId_idx" ON "CartItem"("variantId")');
  await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "CartItem_cartId_productId_idx" ON "CartItem"("cartId","productId")');
  cartSchemaReady=true;
}

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
    const prisma=getPrisma(); await ensureCartVariantSchema(); const id=await getIdentity();
    const cart=id.userId ? await prisma.cart.findFirst({where:{userId:id.userId,status:"ACTIVE"},include:{items:{include:{product:{include:{brand:true,tyre:{include:{size:true}}}}}}}})
      : id.cartId ? await prisma.cart.findFirst({where:{id:id.cartId,userId:null,status:"ACTIVE"},include:{items:{include:{product:{include:{brand:true,tyre:{include:{size:true}}}}}}}}) : null;
    return response({cart});
  }catch{return response({error:"Cart service temporarily unavailable"},503);}
}
export async function POST(req:NextRequest){
  try{
    if(!process.env.DATABASE_URL) return response({error:"Cart database is not configured"},503);
    const {productId,variantId,quantity}=await req.json();
    const qty=Math.max(1,Math.floor(Number(quantity)||1));
    const prisma=getPrisma(); await ensureCartVariantSchema(); const id=await getIdentity();
    const product=await prisma.product.findUnique({
      where:{id:productId},
      include:{variants:true},
    });
    if(!product||product.status!=="ACTIVE") return response({error:"Product unavailable"},404);
    const selectedVariant=variantId
      ? product.variants.find(v=>v.id===String(variantId))
      : null;
    if(variantId && !selectedVariant) return response({error:"Selected variant is unavailable"},404);
    const availableStock=selectedVariant?.stock ?? product.stock;
    if(qty>availableStock) return response({error:"Insufficient stock"},409);
    const selectedPrice=selectedVariant?.price!=null
      ? Number(selectedVariant.price)
      : Number(product.salePrice??product.price);
    let cart=id.userId ? await prisma.cart.findFirst({where:{userId:id.userId,status:"ACTIVE"}}) : id.cartId ? await prisma.cart.findFirst({where:{id:id.cartId,userId:null,status:"ACTIVE"}}) : null;
    if(!cart) cart=await prisma.cart.create({data:{userId:id.userId,currency:product.currency}});
    const existing=await prisma.cartItem.findFirst({
      where:{cartId:cart.id,productId,variantId:variantId?String(variantId):null},
    });
    const item=existing
      ? await prisma.cartItem.update({where:{id:existing.id},data:{quantity:qty,unitPrice:selectedPrice}})
      : await prisma.cartItem.create({data:{cartId:cart.id,productId,variantId:variantId?String(variantId):null,quantity:qty,unitPrice:selectedPrice}});
    return response({item},200,cart.id);
  }catch{return response({error:"Cart service temporarily unavailable"},503);}
}
export async function DELETE(req:NextRequest){
  try{
    if(!process.env.DATABASE_URL) return response({error:"Cart database is not configured"},503);
    const {productId,variantId}=await req.json(); const prisma=getPrisma(); await ensureCartVariantSchema(); const id=await getIdentity();
    const cart=id.userId ? await prisma.cart.findFirst({where:{userId:id.userId,status:"ACTIVE"}}) : id.cartId ? await prisma.cart.findFirst({where:{id:id.cartId,userId:null,status:"ACTIVE"}}) : null;
    if(cart) await prisma.cartItem.deleteMany({where:{cartId:cart.id,productId,...(variantId?{variantId:String(variantId)}:{})}});
    return response({ok:true});
  }catch{return response({error:"Cart service temporarily unavailable"},503);}
}