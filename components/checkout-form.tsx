"use client";
import { useState } from "react";
export function CheckoutForm({ total, currency }: { total: number; currency: string }) {
  const [status,setStatus]=useState("");
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy(true); setStatus("Placing order…");
    const data=Object.fromEntries(new FormData(e.currentTarget));
    const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const json=await res.json();
    if(res.ok){window.location.href="/orders";return;}
    setStatus(json.error??"Unable to place order.");setBusy(false);
  }
  return <form className="checkout-form" onSubmit={submit}>
    <p className="hero-copy">Order total: {currency} {total.toLocaleString()}</p>
    <input name="name" placeholder="Full name" required/><input name="phone" placeholder="Phone" required/>
    <input name="country" placeholder="Country" defaultValue="Pakistan" required/><input name="region" placeholder="State / region"/>
    <input name="city" placeholder="City" required/><input name="line1" placeholder="Address" required/>
    <input name="line2" placeholder="Apartment / area"/><input name="postalCode" placeholder="Postal code"/>
    <select name="paymentMethod" defaultValue="COD"><option value="COD">Cash on delivery</option><option value="BANK_TRANSFER">Bank transfer</option></select>
    <button className="button button-dark" type="submit" disabled={busy}>{busy?"Placing…":"Place order"}</button>
    {status&&<p>{status}</p>}
  </form>;
}