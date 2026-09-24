"use client";

import { useEffect, useState } from "react";
import { CurrencyPrice } from "@/components/currency-price";

type Country = { code: string; name: string; currencyCode: string };

export function CheckoutForm({total,currency,guest}:{total:number;currency:string;guest:boolean}){
  const [countries,setCountries]=useState<Country[]>([]);
  const [country,setCountry]=useState("PK");
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    fetch("/api/countries").then(r=>r.json()).then(data=>{
      if(Array.isArray(data.countries)) setCountries(data.countries);
    }).catch(()=>{});
  },[]);

  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    setBusy(true);
    setStatus("Placing order…");
    const data=Object.fromEntries(new FormData(e.currentTarget));
    const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const json=await res.json();
    if(res.ok){window.location.href=guest?"/order-success?number="+encodeURIComponent(json.order.number):"/orders";return}
    setStatus(json.error??"Unable to place order.");
    setBusy(false);
  }

  const selectedCurrency=countries.find(c=>c.code===country)?.currencyCode;

  return <form className="checkout-form" onSubmit={submit}>
    <p className="hero-copy">Order total: <CurrencyPrice amount={total} from={currency}/></p>
    {selectedCurrency&&selectedCurrency!==currency&&<p className="muted">Shipping country uses {selectedCurrency}. Final shipping, tax and payment currency are confirmed at checkout.</p>}
    {guest&&<input name="email" type="email" placeholder="Email address" required/>}
    <input name="name" placeholder="Full name" required/>
    <input name="phone" placeholder="Phone" required/>
    <select name="country" value={country} onChange={e=>setCountry(e.target.value)} required>
      {countries.length?countries.map(c=><option key={c.code} value={c.code}>{c.name} ({c.currencyCode})</option>):<option value="PK">Pakistan (PKR)</option>}
    </select>
    <input name="region" placeholder="State / region"/>
    <input name="city" placeholder="City" required/>
    <input name="line1" placeholder="Address" required/>
    <input name="line2" placeholder="Apartment / area"/>
    <input name="postalCode" placeholder="Postal code"/>
    <select name="paymentMethod" defaultValue="COD">
      <option value="COD">Cash on delivery</option>
      <option value="BANK_TRANSFER">Bank transfer</option>
    </select>
    <button className="button button-dark" type="submit" disabled={busy}>{busy?"Placing…":"Place order"}</button>
    {status&&<p>{status}</p>}
  </form>
}