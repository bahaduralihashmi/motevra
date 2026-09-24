"use client";
import{useEffect,useState}from"react";

type Data={countries:any[];zones:any[];taxes:any[];suppliers:any[]};
const classes=["STANDARD","HEAVY","BATTERY","LIQUID","ELECTRONICS","TYRE","WHEEL","RESTRICTED"];

export default function ShippingAdmin(){
 const[d,setD]=useState<Data>({countries:[],zones:[],taxes:[],suppliers:[]});
 const[msg,setMsg]=useState(""); const[loading,setLoading]=useState(true);
 const[shipping,setShipping]=useState({zoneId:"",name:"Standard shipping",shippingClass:"",supplierId:"",price:"",currency:"USD",minWeight:"",maxWeight:"",minOrderValue:"",maxOrderValue:""});
 const[tax,setTax]=useState({countryId:"",name:"Sales tax",rate:"",taxClass:""});
 async function load(){setLoading(true);const r=await fetch("/api/admin/commerce");const j=await r.json();if(r.ok)setD(j);else setMsg(j.error||"Unable to load.");setLoading(false)}
 useEffect(()=>{load()},[]);
 async function post(body:any){setMsg("Saving…");const r=await fetch("/api/admin/commerce",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json();setMsg(r.ok?(j.message||"Saved."):(j.error||"Save failed."));if(r.ok)await load()}
 async function initialize(){await post({action:"initialize"})}
 async function addShipping(e:React.FormEvent){e.preventDefault();await post({action:"shippingRule",...shipping})}
 async function addTax(e:React.FormEvent){e.preventDefault();await post({action:"taxRule",...tax})}
 return <main className="section"><div className="container">
  <div className="admin-heading"><div><p className="eyebrow">MOTEVRA COMMERCE</p><h1>Shipping & tax</h1><p className="hero-copy">Configure destination zones, shipping prices and tax rules used by checkout.</p></div><button className="button button-dark" onClick={initialize}>Initialize countries & currencies</button></div>
  {msg&&<p className="muted">{msg}</p>}
  {loading?<p>Loading…</p>:<>
   <section className="admin-card"><h2>Shipping zones</h2><p className="muted">Countries are grouped into zones. Add actual carrier or business shipping prices as rules below.</p>
    {d.zones.map(z=><div key={z.id} className="admin-row"><div><strong>{z.name}</strong><div className="muted">{z.countries.map((x:any)=>x.country.code).join(", ")}</div></div><span>{z.active?"Active":"Inactive"}</span></div>)}
   </section>
   <section className="admin-card"><h2>Add shipping rule</h2><form className="admin-grid" onSubmit={addShipping}>
    <select value={shipping.zoneId} onChange={e=>setShipping({...shipping,zoneId:e.target.value})} required><option value="">Select zone</option>{d.zones.map(z=><option key={z.id} value={z.id}>{z.name}</option>)}</select>
    <input value={shipping.name} onChange={e=>setShipping({...shipping,name:e.target.value})} placeholder="Rule name" required/>
    <select value={shipping.shippingClass} onChange={e=>setShipping({...shipping,shippingClass:e.target.value})}><option value="">All shipping classes</option>{classes.map(x=><option key={x}>{x}</option>)}</select>
    <select value={shipping.supplierId} onChange={e=>setShipping({...shipping,supplierId:e.target.value})}><option value="">All suppliers</option>{d.suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
    <input type="number" min="0" step="0.01" value={shipping.price} onChange={e=>setShipping({...shipping,price:e.target.value})} placeholder="Price" required/>
    <input value={shipping.currency} onChange={e=>setShipping({...shipping,currency:e.target.value.toUpperCase()})} placeholder="Currency (USD)" required/>
    <input type="number" min="0" step="0.01" value={shipping.minWeight} onChange={e=>setShipping({...shipping,minWeight:e.target.value})} placeholder="Min weight kg"/>
    <input type="number" min="0" step="0.01" value={shipping.maxWeight} onChange={e=>setShipping({...shipping,maxWeight:e.target.value})} placeholder="Max weight kg"/>
    <input type="number" min="0" step="0.01" value={shipping.minOrderValue} onChange={e=>setShipping({...shipping,minOrderValue:e.target.value})} placeholder="Min order value"/>
    <input type="number" min="0" step="0.01" value={shipping.maxOrderValue} onChange={e=>setShipping({...shipping,maxOrderValue:e.target.value})} placeholder="Max order value"/>
    <button className="button button-dark" type="submit">Add shipping rule</button>
   </form>
   <div className="admin-list">{d.zones.flatMap(z=>z.rules.map((r:any)=><div key={r.id} className="admin-row"><div><strong>{r.name}</strong><div className="muted">{z.name} · {r.shippingClass||"all classes"} · {r.price} {r.currency}</div></div><span>{r.active?"Active":"Inactive"}</span></div>))}</div>
   </section>
   <section className="admin-card"><h2>Tax rules</h2><p className="muted">Enter the tax rate applicable to each destination. Confirm rates and tax obligations for your business before enabling them.</p>
    <form className="admin-grid" onSubmit={addTax}>
      <select value={tax.countryId} onChange={e=>setTax({...tax,countryId:e.target.value})} required><option value="">Select country</option>{d.countries.map(c=><option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}</select>
      <input value={tax.name} onChange={e=>setTax({...tax,name:e.target.value})} placeholder="Tax name" required/>
      <input type="number" min="0" max="100" step="0.0001" value={tax.rate} onChange={e=>setTax({...tax,rate:e.target.value})} placeholder="Rate %" required/>
      <input value={tax.taxClass} onChange={e=>setTax({...tax,taxClass:e.target.value})} placeholder="Tax class (optional)"/>
      <button className="button button-dark" type="submit">Add tax rule</button>
    </form>
    <div className="admin-list">{d.taxes.map(t=><div key={t.id} className="admin-row"><div><strong>{t.name}</strong><div className="muted">{t.country.name} · {t.rate}%{t.taxClass?" · "+t.taxClass:""}</div></div><span>{t.active?"Active":"Inactive"}</span></div>)}</div>
   </section>
  </>}
 </div></main>
}