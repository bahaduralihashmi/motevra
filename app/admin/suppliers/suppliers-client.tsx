"use client";
import{useEffect,useState}from"react";
const types=[["MOTEVRA","MOTEVRA / Local inventory"],["CJ_DROPSHIPPING","CJ Dropshipping"],["ALIBABA","Alibaba"],["OTHER","Other supplier"]];
export default function SuppliersClient(){
 const[suppliers,setSuppliers]=useState<any[]>([]),[loading,setLoading]=useState(true),[msg,setMsg]=useState("");const[connect,setConnect]=useState<any>(null),[credential,setCredential]=useState(""),[connectionMsg,setConnectionMsg]=useState("");
 async function connectSupplier(e:any){e.preventDefault();if(!connect)return;setConnectionMsg("Testing and securely saving credentials…");const body=connect.type==="CJ_DROPSHIPPING"?{supplierId:connect.id,provider:connect.type,apiKey:credential}:{supplierId:connect.id,provider:"OTHER",fields:{apiKey:credential}};const r=await fetch("/api/admin/supplier-connections",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const j=await r.json();setConnectionMsg(j.message||j.error||"Finished.");if(r.ok){setCredential("");setConnect(null);load()}}

 const[form,setForm]=useState({name:"",slug:"",type:"CJ_DROPSHIPPING",website:"",apiBaseUrl:"",externalAccountId:""});
 async function load(){setLoading(true);const r=await fetch("/api/admin/suppliers");const j=await r.json();if(r.ok)setSuppliers(j.suppliers||[]);else setMsg(j.error||"Unable to load suppliers.");setLoading(false)}
 useEffect(()=>{load()},[]);
 async function save(e:any){e.preventDefault();setMsg("Adding supplier…");const r=await fetch("/api/admin/suppliers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const j=await r.json();if(r.ok){setMsg("Supplier added.");setForm({name:"",slug:"",type:"CJ_DROPSHIPPING",website:"",apiBaseUrl:"",externalAccountId:""});load()}else setMsg(j.error||"Unable to add supplier.")}
 return <main className="section"><div className="container">
  <div className="admin-heading"><div><p className="eyebrow">MOTEVRA COMMERCE</p><h1>Suppliers</h1><p className="hero-copy">Connect and manage local inventory, CJ, Alibaba and other suppliers from one control panel.</p></div></div>
  {msg&&<p className="muted">{msg}</p>}
  <section className="admin-card"><h2>Add supplier</h2><p className="muted">This creates the supplier connection record. API credentials are securely stored by the supplier connection system; never put secret keys in product records.</p>
   <form className="admin-grid" onSubmit={save}>
    <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Supplier name" required/>
    <input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Slug, e.g. cj"/>
    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{types.map(x=><option key={x[0]} value={x[0]}>{x[1]}</option>)}</select>
    <input value={form.website} onChange={e=>setForm({...form,website:e.target.value})} placeholder="Supplier website"/>
    <input value={form.apiBaseUrl} onChange={e=>setForm({...form,apiBaseUrl:e.target.value})} placeholder="API base URL (optional)"/>
    <input value={form.externalAccountId} onChange={e=>setForm({...form,externalAccountId:e.target.value})} placeholder="External account/store ID (optional)"/>
    <button className="button button-dark" type="submit">Add supplier</button>
   </form>
  </section>
  <section className="admin-card"><h2>Configured suppliers</h2>{loading?<p>Loading…</p>:suppliers.length===0?<p className="muted">No suppliers configured yet.</p>:<div className="admin-list">{suppliers.map(s=><div className="admin-row" key={s.id}><div><strong>{s.name}</strong><div className="muted">{s.type} · {s.apiBaseUrl||"Connector not configured"} · {s._count.products} products · {s._count.warehouses} warehouses · {s._count.supplierOrders} orders</div></div><div><span>{s.status==="ACTIVE"?"Active":"Inactive"}</span><button className="button" type="button" onClick={()=>{setConnect(s);setConnectionMsg("")}}>Connect API</button>{s.type==="CJ_DROPSHIPPING"&&<a className="button" href="/admin/suppliers/cj">CJ Catalogue</a>}</div></div>)}</div>}</section>
  {connect&&<section className="admin-card"><h2>Connect {connect.name}</h2><p className="muted">{connect.type==="CJ_DROPSHIPPING"?"CJ uses an API Key. MOTEVRA tests it against CJ, obtains the server-side access/refresh tokens, and never sends the secret to the browser after submission.":"Enter the API credential for this supplier. The credential is encrypted before it is stored."}</p><form className="admin-grid" onSubmit={connectSupplier}><input type="password" value={credential} onChange={e=>setCredential(e.target.value)} placeholder={connect.type==="CJ_DROPSHIPPING"?"CJ API Key":"API key / secret"} required/><button className="button button-dark" type="submit">Test & Connect</button><button className="button" type="button" onClick={()=>setConnect(null)}>Cancel</button></form>{connectionMsg&&<p className="muted">{connectionMsg}</p>}</section>}
  <section className="admin-card"><h2>Connection architecture</h2><div className="muted">Each supplier will have its own connector: authentication, product import, variant mapping, inventory sync, shipping/freight, order submission and tracking. CJ is one connector; other suppliers can be added without changing the storefront or order model.</div></section>
 </div></main>
}