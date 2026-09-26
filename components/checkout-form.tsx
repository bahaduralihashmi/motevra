"use client";

import { useEffect, useState } from "react";
import { CurrencyPrice } from "@/components/currency-price";

type Country={code:string;name:string;currencyCode:string};
type Quote={subtotal:number;shipping:number;tax:number;total:number;displayCurrency:string;shippingConfigured:boolean;taxConfigured:boolean;shippingMethod:string};

export function CheckoutForm({total,currency,guest}:{total:number;currency:string;guest:boolean}){
  const [countries,setCountries]=useState<Country[]>([]);
  const [country,setCountry]=useState("PK");
  const [quote,setQuote]=useState<Quote|null>(null);
  const [quoteLoading,setQuoteLoading]=useState(true);
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);
  const [paymentMethods,setPaymentMethods]=useState<{id:string;name:string;provider:string;instructions?:string|null}[]>([]);
  const [paymentLoading,setPaymentLoading]=useState(true);
  const isPakistan=country==="PK";

  useEffect(()=>{
    fetch("/api/countries").then(r=>r.json()).then(data=>{
      if(Array.isArray(data.countries))setCountries(data.countries);
    }).catch(()=>{});
  },[]);

  useEffect(()=>{
    let cancelled=false;
    setPaymentLoading(true);
    const countryCurrency=countries.find(c=>c.code===country)?.currencyCode||"PKR";
    fetch(`/api/payment-methods?country=${encodeURIComponent(country)}&currency=${encodeURIComponent(countryCurrency)}`,{cache:"no-store"})
      .then(r=>r.json()).then(data=>{if(!cancelled)setPaymentMethods(Array.isArray(data.methods)?data.methods:[])})
      .catch(()=>{if(!cancelled)setPaymentMethods([])})
      .finally(()=>{if(!cancelled)setPaymentLoading(false)});
    return()=>{cancelled=true};
  },[country,countries]);

  useEffect(()=>{
    let cancelled=false;
    setQuoteLoading(true);
    fetch("/api/checkout/quote",{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({country})
    }).then(r=>r.json()).then(data=>{
      if(!cancelled){
        if(data?.total!=null)setQuote(data);
        else setQuote(null);
      }
    }).catch(()=>{if(!cancelled)setQuote(null)})
      .finally(()=>{if(!cancelled)setQuoteLoading(false)});
    return()=>{cancelled=true};
  },[country]);

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);setStatus("Placing order…");
    const data=Object.fromEntries(new FormData(e.currentTarget));
    const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const json=await res.json();
    if(res.ok){
      if(String(data.paymentMethod)==="JAZZCASH"||String(data.paymentMethod)==="EASYPAISA"){
        const init=await fetch("/api/payments/initiate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId:json.order.id,paymentMethod:String(data.paymentMethod),email:String(data.email||""),phone:String(data.phone||"")})});
        const payment=await init.json();
        if(!init.ok){setStatus(payment.error??"Unable to initialize JazzCash.");setBusy(false);return;}
        if(payment.action==="REDIRECT_FORM"&&payment.gatewayUrl&&payment.fields){
          const form=document.createElement("form"); form.method="POST"; form.action=payment.gatewayUrl;
          Object.entries(payment.fields as Record<string,string>).forEach(([key,value])=>{const input=document.createElement("input");input.type="hidden";input.name=key;input.value=String(value);form.appendChild(input)});
          document.body.appendChild(form); form.submit(); return;
        }
      }
      window.location.href=guest?"/order-success?number="+encodeURIComponent(json.order.number):"/orders";return
    }
    setStatus(json.error??"Unable to place order.");setBusy(false);
  }

  const selectedCurrency=countries.find(c=>c.code===country)?.currencyCode||quote?.displayCurrency;
  const displayTotal=quote?.total??total;
  const displayCurrency=quote?.displayCurrency??currency;

  return <form className="checkout-form" onSubmit={submit}>
    <div>
      <p className="hero-copy">Order total: <CurrencyPrice amount={displayTotal} from={displayCurrency}/></p>
      {quoteLoading&&<p className="muted">Calculating shipping and tax…</p>}
      {quote&&!quoteLoading&&<div className="muted" style={{display:"grid",gap:4,marginBottom:16}}>
        <span>Subtotal: <CurrencyPrice amount={quote.subtotal} from={displayCurrency}/></span>
        <span>Shipping: {quote.shippingConfigured?<CurrencyPrice amount={quote.shipping} from={displayCurrency}/>: "Not configured yet"}</span>
        <span>Tax: {quote.taxConfigured?<CurrencyPrice amount={quote.tax} from={displayCurrency}/>: "Not configured yet"}</span>
        <span>{quote.shippingMethod}</span>
      </div>}
      {selectedCurrency&&selectedCurrency!==currency&&<p className="muted">Destination currency: {selectedCurrency}. Shipping and tax are calculated for this country.</p>}
    </div>
    {guest&&<input name="email" type="email" placeholder="Email address" required/>}
    <input name="name" placeholder="Full name" required/>
    <input name="phone" placeholder="Phone" required/>
    <input type="hidden" name="currency" value={selectedCurrency||"PKR"}/>
    <select name="country" value={country} onChange={e=>setCountry(e.target.value)} required>
      {countries.length?countries.map(c=><option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>):<option value="PK">Pakistan (PKR)</option>}
    </select>
    <input name="region" placeholder="State / region"/>
    <input name="city" placeholder="City" required/>
    <input name="line1" placeholder="Address" required/>
    <input name="line2" placeholder="Apartment / area"/>
    <input name="postalCode" placeholder="Postal code"/>
    <select name="paymentMethod" defaultValue="" key={country} required disabled={paymentLoading||paymentMethods.length===0}>
      <option value="" disabled>{paymentLoading?"Loading payment methods…":paymentMethods.length?"Select payment method":"No payment methods configured"}</option>
      {paymentMethods.map(m=><option key={m.id} value={m.provider}>{m.name}</option>)}
    </select>
    {paymentMethods.find(m=>m.provider===paymentMethods[0]?.provider)?.instructions&&<p className="muted">{paymentMethods[0].instructions}</p>}
    <p className="muted">{isPakistan?"Payment methods are managed by MOTEVRA Admin.":"International checkout does not offer cash on delivery."}</p>
    <button className="button button-dark" type="submit" disabled={busy||paymentLoading||paymentMethods.length===0}>{busy?"Placing…":paymentMethods.length?"Place order":"Configure payment method first"}</button>
    {status&&<p>{status}</p>}
  </form>
}