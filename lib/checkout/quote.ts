import { getPrisma } from "@/lib/prisma";

type SupplierProductQuote = {
  supplierId: string;
  active: boolean;
  supplier?: { type: string };
  variants?: Array<{ externalVariantId: string | null; productVariantId: string | null }>;
  inventories?: Array<{
    available: number;
    quantity: number;
    warehouse: { countryCode: string | null };
  }>;
};

type QuoteItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  variantId?: string | null;
  product: {
    shippingClass: string;
    weight: number | null;
    supplierProducts?: SupplierProductQuote[];
    variant?: { id:string; stock:number; price:number|null } | null;
  };
};

type QuoteResult = {
  subtotal: number; shipping: number; tax: number; total: number;
  sourceSubtotal: number; sourceShipping: number; sourceTax: number; sourceTotal: number;
  sourceCurrency: string; displayCurrency: string; exchangeRate: number;
  shippingConfigured: boolean; taxConfigured: boolean; shippingMethod: string; shippingProvider: string;
  shippingOptions: Array<{id:string;name:string;price:number;deliveryEstimate:string;provider:string}>;
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

async function getCJAccessToken(supplierId:string) {
  const p=getPrisma();
  const credential=await p.supplierCredential.findFirst({
    where:{supplierId,provider:"CJ_DROPSHIPPING",status:"CONNECTED"},
    select:{encryptedData:true}
  });
  if(!credential) return null;
  try {
    const {decryptCredentials}=await import("@/lib/supplier-credentials");
    const data=decryptCredentials<{accessToken?:string}>(credential.encryptedData);
    return data.accessToken||null;
  } catch {
    return null;
  }
}

async function calculateCJShipping(
  items: QuoteItem[],
  destination:string,
  sourceCurrency:string,
  rates:Record<string,number>,
  selectedShippingMethod?: string,
) {
  const p=getPrisma();
  let totalUSD=0;
  let configured=true;
  const methods:string[]=[];
  const shippingOptions:Array<{id:string;name:string;price:number;deliveryEstimate:string;provider:string}>=[];

  const groups=new Map<string,{supplierId:string;origin:string;products:{quantity:number;vid:string}[]}>();
  for(const item of items){
    const sp=item.product.supplierProducts?.find(s=>s.active&&s.supplier?.type==="CJ_DROPSHIPPING");
    if(!sp) continue;
    const variant=sp.variants?.find(v=>v.externalVariantId && (!item.variantId || v.productVariantId===item.variantId));
    const inventory=sp.inventories?.find(i=>Number(i.available??i.quantity)>0&&i.warehouse.countryCode);
    if(!variant?.externalVariantId||!inventory?.warehouse.countryCode){
      configured=false;
      continue;
    }
    const origin=String(inventory.warehouse.countryCode).toUpperCase();
    const key=sp.supplierId+":"+origin;
    const group=groups.get(key)||{supplierId:sp.supplierId,origin,products:[]};
    group.products.push({quantity:item.quantity,vid:variant.externalVariantId});
    groups.set(key,group);
  }

  for(const group of groups.values()){
    const token=await getCJAccessToken(group.supplierId);
    if(!token){configured=false;continue;}
    const response=await fetch("https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculate",{
      method:"POST",
      headers:{"Content-Type":"application/json","CJ-Access-Token":token},
      body:JSON.stringify({
        startCountryCode:group.origin,
        endCountryCode:destination,
        products:group.products,
      }),
      cache:"no-store",
    });
    const data=await response.json().catch(()=>null);
    if(!response.ok||data?.code!==200||!Array.isArray(data?.data)||!data.data.length){
      configured=false;
      continue;
    }
    const options=data.data
      .map((x:any)=>({
        name:String(x.logisticName||"CJ Shipping"),
        price:Number(x.logisticPrice??x.totalPostageFee??0),
        aging:String(x.logisticAging||""),
      }))
      .filter((x:{price:number})=>Number.isFinite(x.price)&&x.price>=0)
      .sort((a:{price:number},b:{price:number})=>a.price-b.price);
    if(!options.length){configured=false;continue;}
    for(const option of options){
      const id=Buffer.from(JSON.stringify({name:option.name,price:option.price,aging:option.aging})).toString("base64url");
      if(!shippingOptions.some(x=>x.id===id)) shippingOptions.push({id,name:option.name,price:convert(option.price,"USD",sourceCurrency,rates),deliveryEstimate:option.aging||"Estimated delivery unavailable",provider:"CJ_DROPSHIPPING"});
    }
    const selected=selectedShippingMethod
      ? options.find((option:{name:string})=>Buffer.from(JSON.stringify({name:option.name,price:option.price,aging:option.aging})).toString("base64url")===selectedShippingMethod)
      : options[0];
    const effective=selected||options[0];
    totalUSD+=effective.price;
    methods.push(effective.name+(effective.aging?" ("+effective.aging+" days)":""));
  }

  return {
    shipping:convert(totalUSD,"USD",sourceCurrency,rates),
    configured,
    method:methods.join(" + "),
    shippingOptions,
  };
}

export async function buildCheckoutQuote(items:QuoteItem[],countryCode:string,sourceCurrency:string,selectedShippingMethod?:string):Promise<QuoteResult>{
  const p=getPrisma();
  const country=countryCode.toUpperCase();
  const dbCountry=await p.country.findUnique({where:{code:country},select:{id:true,currencyCode:true}});
  const displayCurrency=dbCountry?.currencyCode || COUNTRY_CURRENCIES[country] || sourceCurrency || "USD";
  const rates=await getRates();
  const exchangeRate=convert(1,sourceCurrency,displayCurrency,rates);
  const sourceSubtotal=items.reduce((sum,item)=>sum+Number(item.unitPrice)*item.quantity,0);

  let sourceShipping=0,shippingConfigured=true;
  const cj=await calculateCJShipping(items,country,sourceCurrency,rates,selectedShippingMethod);
  sourceShipping+=cj.shipping;
  if(cj.method) {
    // CJ products are quoted directly from CJ; local products continue through MOTEVRA shipping rules below.
  }
  if(!cj.configured&&items.some(i=>i.product.supplierProducts?.some(s=>s.active&&s.supplier?.type==="CJ_DROPSHIPPING"))){
    shippingConfigured=false;
  }

  const hasCJItems=items.some(i=>i.product.supplierProducts?.some(s=>s.active&&s.supplier?.type==="CJ_DROPSHIPPING"));
  const localItems=items.filter(i=>!i.product.supplierProducts?.some(s=>s.active&&s.supplier?.type==="CJ_DROPSHIPPING"));
  if(localItems.length){
    if(dbCountry){
      const memberships=await p.shippingZoneCountry.findMany({
        where:{countryId:dbCountry.id,zone:{active:true}},select:{zoneId:true}
      });
      const zoneIds=memberships.map(m=>m.zoneId);
      if(zoneIds.length){
        const rules=await p.shippingRule.findMany({where:{zoneId:{in:zoneIds},active:true},orderBy:{price:"asc"}});
        const groups=new Map<string,{weight:number;value:number;shippingClass:string;supplierId?:string}>();
        for(const item of localItems){
          const supplierId=item.product.supplierProducts?.find(s=>s.active)?.supplierId;
          const key=item.product.shippingClass+":"+(supplierId||"MOTEVRA");
          const g=groups.get(key)||{weight:0,value:0,shippingClass:item.product.shippingClass,supplierId};
          g.weight+=(item.product.weight||0)*item.quantity; g.value+=Number(item.unitPrice)*item.quantity; groups.set(key,g);
        }
        for(const g of groups.values()){
          const candidates=rules.filter(rule=>
            (!rule.shippingClass||rule.shippingClass===g.shippingClass)&&
            (!rule.supplierId||rule.supplierId===g.supplierId)&&
            (!rule.minWeight||g.weight>=rule.minWeight)&&
            (!rule.maxWeight||g.weight<=rule.maxWeight)&&
            (!rule.minOrderValue||g.value>=Number(rule.minOrderValue))&&
            (!rule.maxOrderValue||g.value<=Number(rule.maxOrderValue))
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
  }

  let taxRate=0,taxConfigured=false;
  if(dbCountry){
    const taxRules=await p.taxRule.findMany({where:{countryId:dbCountry.id,active:true},orderBy:{rate:"asc"}});
    const generic=taxRules.find(rule=>!rule.taxClass);
    if(generic){taxRate=Number(generic.rate)/100;taxConfigured=true;}
  }
  const sourceTax=(sourceSubtotal+sourceShipping)*taxRate;
  const sourceTotal=sourceSubtotal+sourceShipping+sourceTax;
  const methods=[
    ...(cj.method?[cj.method]:[]),
    ...(shippingConfigured&&localItems.length?["MOTEVRA shipping"]:[]),
  ];
  return {
    subtotal:sourceSubtotal*exchangeRate,shipping:sourceShipping*exchangeRate,tax:sourceTax*exchangeRate,total:sourceTotal*exchangeRate,
    sourceSubtotal,sourceShipping,sourceTax,sourceTotal,sourceCurrency,displayCurrency,exchangeRate,
    shippingConfigured,taxConfigured,shippingMethod:methods.join(" + ")||"Shipping quote unavailable",shippingProvider:methods.length ? (cj.method ? "CJ_DROPSHIPPING" : "MOTEVRA") : "NONE",
    shippingOptions: cj.shippingOptions.map(option=>({...option,price:option.price*exchangeRate}))
  };
}
