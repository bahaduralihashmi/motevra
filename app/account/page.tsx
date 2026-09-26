import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CurrencyPrice } from "@/components/currency-price";
export const runtime="nodejs";
export default async function AccountPage(){
 const session=await auth(); if(!session?.user?.email) redirect("/signin");
 const p=getPrisma(); const user=await p.user.findUnique({where:{email:session.user.email},include:{addresses:{orderBy:{isDefault:"desc"}},wishlist:{include:{items:{select:{id:true}}}},orders:{orderBy:{createdAt:"desc"},take:5,include:{items:{include:{product:{select:{name:true}}}}}}}});
 if(!user) redirect("/signin");
 return <><SiteHeader/><main><section className="page-hero"><div className="container narrow"><p className="eyebrow">YOUR MOTEVRA ACCOUNT</p><h1>Welcome{user.name?", "+user.name:""}.</h1><p className="hero-copy">{user.email}</p></div></section>
 <section className="section"><div className="container"><div className="account-grid">
 <Link className="account-card" href="/orders"><span>01</span><h2>Orders</h2><p>{user.orders.length?user.orders.length+" recent order"+(user.orders.length===1?"":"s"):"View your order history and tracking."}</p></Link>
 <Link className="account-card" href="/wishlist"><span>02</span><h2>Wishlist</h2><p>{user.wishlist?.items.length||0} saved products.</p></Link>
 <Link className="account-card" href="/account/addresses"><span>03</span><h2>Addresses</h2><p>{user.addresses.length} saved address{user.addresses.length===1?"":"es"}.</p></Link>
 <Link className="account-card" href="/returns"><span>04</span><h2>Returns</h2><p>Review return terms and support options.</p></Link>
 </div><div className="account-section"><div className="section-head"><div><p className="eyebrow">RECENT ORDERS</p><h2>Your latest activity.</h2></div><Link className="text-link" href="/orders">View all →</Link></div>
 {user.orders.length?<div className="order-list">{user.orders.map(o=><Link className="order-card" href={"/orders/"+o.number} key={o.id}><strong>{o.number}</strong><span>{o.status.replaceAll("_"," ")} · <CurrencyPrice amount={Number(o.total)} from={o.currency}/></span><small>{o.items.map(i=>i.product.name+" × "+i.quantity).join(" · ")}</small></Link>)}</div>:<p className="muted">No orders yet. <Link className="text-link" href="/shop">Start shopping →</Link></p>}</div>
 <div className="account-section"><div className="section-head"><div><p className="eyebrow">SAVED DETAILS</p><h2>Delivery made easier.</h2></div><Link className="text-link" href="/account/addresses">Manage addresses →</Link></div>
 <div className="saved-detail-grid">{user.addresses.slice(0,2).map(a=><article className="saved-detail" key={a.id}><strong>{a.label||"Address"}</strong><p>{a.line1}{a.line2?", "+a.line2:""}<br/>{a.city}{a.region?", "+a.region:""} · {a.country}</p>{a.isDefault&&<small>Default delivery address</small>}</article>)}{!user.addresses.length&&<p className="muted">No saved addresses yet.</p>}</div></div>
 </div></section></main><SiteFooter/></>;
}