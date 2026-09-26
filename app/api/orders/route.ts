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
  return NextResponse.json({orders:await p.order.findMany({where:{userId:u.id},orderBy:{createdAt:"desc"},include:{items:{include:{product:true,variant:true}},shipments:{include:{trackingEvents:true,supplierOrder:{include:{supplier:true}}}}}})});
}

export async function POST(req:NextRequest){
  try{
    const s=await auth().catch(()=>null);
    const body=await req.json();
    const required=["name","phone","country","city","line1"];
    if(required.some(k=>!String(body[k]??"").trim()))return NextResponse.json({error:"Complete the shipping address."},{status:400});
    if(!s?.user?.email&&!String(body.email??"").trim())return NextResponse.json({error:"Email is required for guest checkout."},{status:400});

    const destinationCountry=String(body.country).trim().toUpperCase();
    const requestedPayment=body.paymentMethod==="COD"?"COD":"BANK_TRANSFER";
    if(requestedPayment==="COD" && destinationCountry!=="PK"){
      return NextResponse.json({error:"Cash on delivery is available only in Pakistan. Please select bank transfer or another available payment method."},{status:400});
    }

    const p=getPrisma();
    let userId:string|null=null;
    if(s?.user?.email){
      const u=await p.user.findUnique({where:{email:s.user.email},select:{id:true}});
      if(!u)return NextResponse.json({error:"Account not found"},{status:404});
      userId=u.id;
    }

    const c=await cookies();
    const cartId=c.get("motevra_cart")?.value;
    const include={items:{include:{product:{include:{variants:true,supplierProducts:{where:{active:true},select:{supplierId:true,active:true,supplier:{select:{type:true}},variants:{select:{id:true,externalVariantId:true,productVariantId:true,supplierCost:true,supplierCurrency:true}},inventories:{where:{available:{gt:0}},select:{available:true,quantity:true,warehouse:{select:{countryCode:true}}}}}}}}}}};
    const cart=userId
      ? await p.cart.findFirst({where:{userId,status:"ACTIVE"},include})
      : cartId
        ? await p.cart.findFirst({where:{id:cartId,userId:null,status:"ACTIVE"},include})
        : null;

    if(!cart?.items.length)return NextResponse.json({error:"Cart is empty."},{status:400});
    for(const item of cart.items){
      const selectedVariant=item.variantId ? item.product.variants.find(v=>v.id===item.variantId) : null;
      const availableStock=selectedVariant?.stock ?? item.product.stock;
      if(item.variantId && !selectedVariant){
        return NextResponse.json({error:"Selected variant is unavailable for "+item.product.name},{status:409});
      }
      if(item.quantity>availableStock||item.product.status!=="ACTIVE"){
        return NextResponse.json({error:"Unavailable stock for "+item.product.name},{status:409});
      }
    }

    const quote=await buildCheckoutQuote(
      cart.items.map(i=>({
        productId:i.productId,
        variantId:i.variantId,
        quantity:i.quantity,
        unitPrice:Number(i.unitPrice),
        product:{
          shippingClass:i.product.shippingClass,
          weight:i.product.weight,
          supplierProducts:i.product.supplierProducts,
          variant:i.variantId
              ? (() => {
                  const variant=i.product.variants.find(v=>v.id===i.variantId);
                  return variant
                    ? {id:variant.id,stock:variant.stock,price:variant.price==null?null:Number(variant.price)}
                    : undefined;
                })()
              : undefined,
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
          paymentMethod:requestedPayment,
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
          shippingCountry:destinationCountry,
          shippingRegion:String(body.region??"").trim()||null,
          shippingCity:String(body.city).trim(),
          shippingLine1:String(body.line1).trim(),
          shippingLine2:String(body.line2??"").trim()||null,
          shippingPostalCode:String(body.postalCode??"").trim()||null,
          items:{create:cart.items.map(i=>({
            productId:i.productId,
            variantId:i.variantId,
            quantity:i.quantity,
            price:Number(i.unitPrice),
            currency:quote.sourceCurrency,
            supplierCost:(i.variantId
              ? i.product.supplierProducts.flatMap(sp=>sp.variants).find(v=>v.productVariantId===i.variantId)?.supplierCost
              : i.product.supplierProducts.flatMap(sp=>sp.variants).find(v=>v.externalVariantId)?.supplierCost) ?? null,
            supplierCurrency:(i.variantId
              ? i.product.supplierProducts.flatMap(sp=>sp.variants).find(v=>v.productVariantId===i.variantId)?.supplierCurrency
              : i.product.supplierProducts.flatMap(sp=>sp.variants).find(v=>v.externalVariantId)?.supplierCurrency) ?? null,
          }))},
        },
      });
      for(const i of cart.items){
        if(i.variantId){
          await tx.productVariant.update({where:{id:i.variantId},data:{stock:{decrement:i.quantity}}});
        } else {
          await tx.product.update({where:{id:i.productId},data:{stock:{decrement:i.quantity}}});
        }
      }
      await tx.cart.update({where:{id:cart.id},data:{status:"CONVERTED"}});
      await tx.paymentTransaction.create({
        data:{
          orderId:created.id,
          provider:requestedPayment,
          status:"PENDING",
          amount:quote.total,
          currency:quote.displayCurrency,
          baseAmount:quote.sourceTotal,
          baseCurrency:quote.sourceCurrency,
          exchangeRate:quote.exchangeRate,
          metadata:{source:"checkout",paymentMethod:requestedPayment},
        },
      });
      return created;
    });

    return NextResponse.json({order},{status:201});
  }catch(e){
    console.error(e);
    return NextResponse.json({error:"Unable to place order right now."},{status:500});
  }
}