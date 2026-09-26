import { NextRequest, NextResponse } from "next/server";
import { getEnabledPaymentMethods } from "@/lib/payment-method-config";
export const runtime="nodejs";
export async function GET(req:NextRequest){
  try{
    const url=new URL(req.url);
    const country=String(url.searchParams.get("country")||"PK").toUpperCase();
    const currency=String(url.searchParams.get("currency")||"PKR").toUpperCase();
    return NextResponse.json({country,currency,methods:await getEnabledPaymentMethods(country,currency)});
  }catch(error){
    console.error("Payment methods lookup error:",error);
    return NextResponse.json({error:"Unable to load payment methods."},{status:500});
  }
}
