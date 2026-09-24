import { NextRequest,NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";

export const runtime="nodejs";
const deny=()=>NextResponse.json({error:"Admin access required."},{status:403});

const CURRENCIES=[
["USD","US Dollar","$",2],["PKR","Pakistani Rupee","₨",0],["EUR","Euro","€",2],["GBP","British Pound","£",2],
["AED","UAE Dirham","د.إ",2],["SAR","Saudi Riyal","﷼",2],["QAR","Qatari Riyal","﷼",2],["KWD","Kuwaiti Dinar","د.ك",3],
["CAD","Canadian Dollar","CA$",2],["AUD","Australian Dollar","A$",2],["NZD","New Zealand Dollar","NZ$",2],
["SGD","Singapore Dollar","S$",2],["MYR","Malaysian Ringgit","RM",2],["INR","Indian Rupee","₹",2],
["CNY","Chinese Yuan","¥",2],["JPY","Japanese Yen","¥",0],["KRW","South Korean Won","₩",0],
["CHF","Swiss Franc","CHF",2],["SEK","Swedish Krona","kr",2],["NOK","Norwegian Krone","kr",2],
["DKK","Danish Krone","kr",2],["PLN","Polish Zloty","zł",2],["TRY","Turkish Lira","₺",2],
["ZAR","South African Rand","R",2],["BRL","Brazilian Real","R$",2],["MXN","Mexican Peso","MX$",2],
["THB","Thai Baht","฿",2],["IDR","Indonesian Rupiah","Rp",0],
] as const;

const COUNTRIES=[
["PK","Pakistan","PKR"],["US","United States","USD"],["CA","Canada","CAD"],["GB","United Kingdom","GBP"],
["AE","United Arab Emirates","AED"],["SA","Saudi Arabia","SAR"],["QA","Qatar","QAR"],["KW","Kuwait","KWD"],
["AU","Australia","AUD"],["NZ","New Zealand","NZD"],["SG","Singapore","SGD"],["MY","Malaysia","MYR"],
["IN","India","INR"],["CN","China","CNY"],["JP","Japan","JPY"],["KR","South Korea","KRW"],
["DE","Germany","EUR"],["FR","France","EUR"],["IT","Italy","EUR"],["ES","Spain","EUR"],["NL","Netherlands","EUR"],
["BE","Belgium","EUR"],["AT","Austria","EUR"],["PT","Portugal","EUR"],["IE","Ireland","EUR"],["CH","Switzerland","CHF"],
["SE","Sweden","SEK"],["NO","Norway","NOK"],["DK","Denmark","DKK"],["PL","Poland","PLN"],["TR","Türkiye","TRY"],
["ZA","South Africa","ZAR"],["BR","Brazil","BRL"],["MX","Mexico","MXN"],["TH","Thailand","THB"],["ID","Indonesia","IDR"],
] as const;

const zoneFor=(code:string)=>{
  if(code==="PK")return "Pakistan";
  if(["AE","SA","QA","KW"].includes(code))return "GCC";
  if(["US","CA","MX"].includes(code))return "North America";
  if(["DE","FR","IT","ES","NL","BE","AT","PT","IE","CH","SE","NO","DK","PL","GB","TR"].includes(code))return "Europe";
  return "Asia Pacific & Other";
};

export async function GET(){
  if(!await getAdminUser())return deny();
  try{
    const p=getPrisma();
    const [countries,zones,suppliers]=await Promise.all([
      p.country.findMany({orderBy:{name:"asc"}}),
      p.shippingZone.findMany({include:{countries:{include:{country:true}},rules:{include:{supplier:true},orderBy:{name:"asc"}}},orderBy:{name:"asc"}}),
      p.supplier.findMany({orderBy:{name:"asc"}})
    ]);
    const taxes=await p.taxRule.findMany({include:{country:true},orderBy:{country:{name:"asc"}}});
    return NextResponse.json({countries,zones,taxes,suppliers});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to load commerce settings."},{status:500})}
}

export async function POST(req:NextRequest){
  if(!await getAdminUser())return deny();
  const b=await req.json(); const action=String(b.action||"");
  try{
    const p=getPrisma();

    if(action==="initialize"){
      await p.$transaction(async tx=>{
        for(const [code,name,symbol,decimals] of CURRENCIES){
          await tx.currency.upsert({where:{code},update:{name,symbol,decimals,active:true},create:{code,name,symbol,decimals}});
        }
        for(const [code,name,currencyCode] of COUNTRIES){
          await tx.country.upsert({where:{code},update:{name,currencyCode,active:true},create:{code,name,currencyCode}});
        }
        const names=[...new Set(COUNTRIES.map(([code])=>zoneFor(code)))];
        for(const name of names)await tx.shippingZone.upsert({where:{id:"__motevra_"+name.toLowerCase().replace(/[^a-z0-9]+/g,"-")},update:{name,active:true},create:{id:"__motevra_"+name.toLowerCase().replace(/[^a-z0-9]+/g,"-"),name,active:true}});
        for(const [code] of COUNTRIES){
          const country=await tx.country.findUniqueOrThrow({where:{code}});
          const zoneName=zoneFor(code); const id="__motevra_"+zoneName.toLowerCase().replace(/[^a-z0-9]+/g,"-");
          await tx.shippingZoneCountry.upsert({where:{zoneId_countryId:{zoneId:id,countryId:country.id}},update:{},create:{zoneId:id,countryId:country.id}});
        }
        await tx.supplier.upsert({where:{slug:"motevra"},update:{name:"MOTEVRA",type:"MOTEVRA",status:"ACTIVE"},create:{name:"MOTEVRA",slug:"motevra",type:"MOTEVRA",status:"ACTIVE"}});
      });
      return NextResponse.json({ok:true,message:"Countries, currencies, shipping zones and MOTEVRA supplier initialized."});
    }

    if(action==="shippingRule"){
      const zoneId=String(b.zoneId||""),price=Number(b.price);
      if(!zoneId||!String(b.name||"").trim()||!Number.isFinite(price)||price<0)return NextResponse.json({error:"Zone, rule name and valid price are required."},{status:400});
      const rule=await p.shippingRule.create({data:{
        zoneId,name:String(b.name).trim(),shippingClass:b.shippingClass||null,supplierId:String(b.supplierId||"")||null,
        minWeight:b.minWeight!==""&&b.minWeight!=null?Number(b.minWeight):null,maxWeight:b.maxWeight!==""&&b.maxWeight!=null?Number(b.maxWeight):null,
        minOrderValue:b.minOrderValue!==""&&b.minOrderValue!=null?Number(b.minOrderValue):null,maxOrderValue:b.maxOrderValue!==""&&b.maxOrderValue!=null?Number(b.maxOrderValue):null,
        price,currency:String(b.currency||"USD").toUpperCase(),active:true
      }});
      return NextResponse.json({rule},{status:201});
    }

    if(action==="taxRule"){
      const countryId=String(b.countryId||""),rate=Number(b.rate);
      if(!countryId||!String(b.name||"").trim()||!Number.isFinite(rate)||rate<0||rate>100)return NextResponse.json({error:"Country, tax name and rate from 0 to 100 are required."},{status:400});
      const rule=await p.taxRule.create({data:{countryId,name:String(b.name).trim(),taxClass:String(b.taxClass||"")||null,rate,active:true}});
      return NextResponse.json({rule},{status:201});
    }

    if(action==="toggleZone"){
      const zone=await p.shippingZone.update({where:{id:String(b.id)},data:{active:Boolean(b.active)}});
      return NextResponse.json({zone});
    }
    if(action==="toggleShippingRule"){
      const rule=await p.shippingRule.update({where:{id:String(b.id)},data:{active:Boolean(b.active)}});
      return NextResponse.json({rule});
    }
    if(action==="toggleTaxRule"){
      const rule=await p.taxRule.update({where:{id:String(b.id)},data:{active:Boolean(b.active)}});
      return NextResponse.json({rule});
    }
    return NextResponse.json({error:"Unknown action."},{status:400});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Commerce configuration failed."},{status:400})}
}