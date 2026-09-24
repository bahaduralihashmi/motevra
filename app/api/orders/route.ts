import { NextRequest,NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { buildCheckoutQuote } from "@/lib/checkout/quote";

export const runtime="nodejs";

export async function GET(){
  const s=await auth().catch(()=>null);
  if(!s?.user?.email)return NextResponse.json({error:"Sign in required"},{status:401});
  const p=getPrisma();
  const u=await p.user.findUnique({where:{email:s.user.email},select:{id:true}});
  if(!u)return NextResponse.json({orders:[]});
  return NextResponse.json({orders:await p.order.findMany({where:{userId:u.id},orderBy:{createdAt:"desc"},include:{items:{include:{product:true}}}})});
}

export async function POST(req:NextRequest){
  try{
    const s=await auth().catch(()=>null);
    const body=await req.json();
    const required=["name","phone","country","city","line1"];
    if(required.some(k=>!String(body[k]??"").trim()))return NextResponse.json({error:"Complete the shipping address."},{status:400});
    if(!s?.user?.email&&!String(body.email??"").trim())return NextResponse.json({error:"Email is required for guest checkout."},{status:400});

    const p=getPrisma();
    let userId:string|null=null;
    if(s?.user?.email){
      const u=await p.user.findUnique({where:{email:s.user.email},select:{id:true}});
      if(!u)return NextResponse.json({error:"Account not found"},{status:404});
      userId=u.id;
    }

    const c=await cookies();
    const cartId=c.get("motevra_cart")?.value;
    const include={items:{include:{product:{include:{supplierProducts:{where:{active:true},select:{supplierId:true,active:true}}}}}}};
    const cart=userId
      ? await p.cart.findFirst({where:{userId,status:"ACTIVE"},include})
      : cartId
        ? await p.cart.findFirst({where:{id:cartId,userId:null,status:"ACTIVE"},include})
        : null;

    if(!cart?.items.length)return NextResponse.json({error:"Cart is empty."},{status:400});
    for(const item of cart.items){
      if(item.quantity>item.product.stock||item.product.status!=="ACTIVE"){
        return NextResponse.json({error:"Unavailable stock for "+item.product.name},{status:409});
      }
    }

    const quote=await buildCheckoutQuote(
      cart.items.map(i=>({
        productId:i.productId,
        quantity:i.quantity,
        unitPrice:Number(i.unitPrice),
        product:{
          shippingClass:i.product.shippingClass,
          weight:i.product.weight,
          supplierProducts:i.product.supplierProducts,
        },
      })),
      String(body.country).trim().toUpperCase(),
      cart.currency||"USD",
    );

    const orderNumber="MOT-"+Date.now().toString(36).toUpperCase();
    const order=await p.$transaction(async tx=>{
      const created=await tx.order.create({
        data:{
          number:orderNumber,
          userId,
          status:"PENDING",
          paymentMethod:body.paymentMethod==="BANK_TRANSFER"?"BANK_TRANSFER":"COD",
          paymentStatus:"PENDING",
          currency:quote.displayCurrency,
          baseCurrency:quote.sourceCurrency,
          displayCurrency:quote.displayCurrency,
          exchangeRate:quote.exchangeRate,
          subtotal:quote.subtotal,
          shippingTotal:quote.shipping,
          taxTotal:quote.tax,
          total:quote.total,
          baseSubtotal:quote.sourceSubtotal,
          baseShippingTotal:quote.sourceShipping,
          baseTaxTotal:quote.sourceTax,
          baseTotal:quote.sourceTotal,
          guestEmail:userId?null:String(body.email).trim(),
          guestName:userId?null:String(body.name).trim(),
          guestPhone:userId?null:String(body.phone).trim(),
          shippingName:String(body.name).trim(),
          shippingPhone:String(body.phone).trim(),
          shippingCountry:String(body.country).trim().toUpperCase(),
          shippingRegion:String(body.region??"").trim()||null,
          shippingCity:String(body.city).trim(),
          shippingLine1:String(body.line1).trim(),
          shippingLine2:String(body.line2??"").trim()||null,
          shippingPostalCode:String(body.postalCode??"").trim()||null,
          items:{create:cart.items.map(i=>({
            productId:i.productId,
            quantity:i.quantity,
            price:Number(i.unitPrice),
            currency:quote.sourceCurrency,
          }))},
        },
      });
      for(const i of cart.items)await tx.product.update({where:{id:i.productId},data:{stock:{decrement:i.quantity}}});
      await tx.cart.update({where:{id:cart.id},data:{status:"CONVERTED"}});
      return created;
    });

    return NextResponse.json({order},{status:201});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Unable to place order right now."},{status:500});
  }
}