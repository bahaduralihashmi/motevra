import { getPrisma } from "@/lib/prisma";

type QuoteItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    shippingClass: string;
    weight: number | null;
    supplierProducts?: Array<{ supplierId: string; active: boolean }>;
  };
};

type QuoteResult = {
  subtotal: number; shipping: number; tax: number; total: number;
  sourceSubtotal: number; sourceShipping: number; sourceTax: number; sourceTotal: number;
  sourceCurrency: string; displayCurrency: string; exchangeRate: number;
  shippingConfigured: boolean; taxConfigured: boolean; shippingMethod: string;
};

const COUNTRY_CURRENCIES: Record<string, string> = {
  PK:"PKR",US:"USD",CA:"CAD",GB:"GBP",AE:"AED",SA:"SAR",QA:"QAR",KW:"KWD",AU:"AUD",NZ:"NZD",
  SG:"SGD",MY:"MYR",IN:"INR",CN:"CNY",JP:"JPY",KR:"KRW",DE:"EUR",FR:"EUR",IT:"EUR",ES:"EUR",
  NL:"EUR",BE:"EUR",AT:"EUR",PT:"EUR",IE:"EUR",CH:"CHF",SE:"SEK",NO:"NOK",DK:"DKK",PL:"PLN",
  TR:"TRY",ZA:"ZAR",BR:"BRL",MX:"MXN",TH:"THB",ID:"IDR"
};

async function getRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD",{next:{revalidate:1800}});
    const data = await response.json();
    if(data?.rates && typeof data.rates==="object") return {USD:1,...data.rates} as Record<string,number>;
  } catch {}
  return {USD:1} as Record<string,number>;
}

function convert(amount:number,from:string,to:string,rates:Record<string,number>) {
  if(from===to) return amount;
  const a=rates[from], b=rates[to];
  return a && b ? amount*(b/a) : amount;
}

export async function buildCheckoutQuote(items:QuoteItem[],countryCode:string,sourceCurrency:string):Promise<QuoteResult>{
  const p=getPrisma();
  const country=countryCode.toUpperCase();
  const dbCountry=await p.country.findUnique({where:{code:country},select:{id:true,currencyCode:true}});
  const displayCurrency=dbCountry?.currencyCode || COUNTRY_CURRENCIES[country] || sourceCurrency || "USD";
  const rates=await getRates();
  const exchangeRate=convert(1,sourceCurrency,displayCurrency,rates);
  const sourceSubtotal=items.reduce((sum,item)=>sum+Number(item.unitPrice)*item.quantity,0);

  let sourceShipping=0,shippingConfigured=true;
  if(dbCountry){
    const memberships=await p.shippingZoneCountry.findMany({
      where:{countryId:dbCountry.id,zone:{active:true}},select:{zoneId:true}
    });
    const zoneIds=memberships.map(m=>m.zoneId);
    if(zoneIds.length){
      const rules=await p.shippingRule.findMany({where:{zoneId:{in:zoneIds},active:true},orderBy:{price:"asc"}});
      const groups=new Map<string,{weight:number;value:number;shippingClass:string;supplierId?:string}>();
      for(const item of items){
        const supplierId=item.product.supplierProducts?.find(s=>s.active)?.supplierId;
        const key=item.product.shippingClass+":"+(supplierId||"MOTEVRA");
        const g=groups.get(key)||{weight:0,value:0,shippingClass:item.product.shippingClass,supplierId};
        g.weight+=(item.product.weight||0)*item.quantity; g.value+=Number(item.unitPrice)*item.quantity; groups.set(key,g);
      }
      for(const g of groups.values()){
        const candidates=rules.filter(rule=>
          (!rule.shippingClass||rule.shippingClass===g.shippingClass)&&
          (!rule.supplierId||rule.supplierId===g.supplierId)&&
          (rule.minWeight==null||g.weight>=rule.minWeight)&&
          (rule.maxWeight==null||g.weight<=rule.maxWeight)&&
          (rule.minOrderValue==null||g.value>=Number(rule.minOrderValue))&&
          (rule.maxOrderValue==null||g.value<=Number(rule.maxOrderValue))
        );
        const rule=candidates.sort((a,b)=>{
          const sa=Number(Boolean(a.shippingClass))+Number(Boolean(a.supplierId))+Number(a.minWeight!=null)+Number(a.maxWeight!=null);
          const sb=Number(Boolean(b.shippingClass))+Number(Boolean(b.supplierId))+Number(b.minWeight!=null)+Number(b.maxWeight!=null);
          return sb-sa||Number(a.price)-Number(b.price);
        })[0];
        if(rule) sourceShipping+=convert(Number(rule.price),rule.currency,sourceCurrency,rates);
        else shippingConfigured=false;
      }
    } else shippingConfigured=false;
  } else shippingConfigured=false;

  let taxRate=0,taxConfigured=false;
  if(dbCountry){
    const taxRules=await p.taxRule.findMany({where:{countryId:dbCountry.id,active:true},orderBy:{rate:"asc"}});
    const generic=taxRules.find(rule=>!rule.taxClass);
    if(generic){taxRate=Number(generic.rate)/100;taxConfigured=true;}
  }
  const sourceTax=(sourceSubtotal+sourceShipping)*taxRate;
  const sourceTotal=sourceSubtotal+sourceShipping+sourceTax;
  return {
    subtotal:sourceSubtotal*exchangeRate,shipping:sourceShipping*exchangeRate,tax:sourceTax*exchangeRate,total:sourceTotal*exchangeRate,
    sourceSubtotal,sourceShipping,sourceTax,sourceTotal,sourceCurrency,displayCurrency,exchangeRate,
    shippingConfigured,taxConfigured,shippingMethod:shippingConfigured?"Standard shipping":"Shipping rule not configured"
  };
}
