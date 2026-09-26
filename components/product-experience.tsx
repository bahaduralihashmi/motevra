"use client";
import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CurrencyPrice } from "@/components/currency-price";
type Review={id:string;rating:number;title:string|null;comment:string;name:string;createdAt:string};
type Product={id:string;name:string;sku:string;price:number;currency:string;stock:number;brand:string;category:string;productType:string;description:string;images:{id:string;url:string;alt:string}[];variants:{id:string;name:string|null;sku:string;price:number|null;stock:number;options:unknown}[];tyre:{size:string;loadIndex:number|null;speedRating:string|null;season:string|null;runFlat:boolean;warranty:string|null}|null;fitments:{make:string;model:string;variant:string;yearFrom:number;yearTo:number|null;engine:string|null;notes:string|null}[];reviews:Review[];averageRating:number|null;count:number};
export function ProductExperience({product}:{product:Product}){
 const [image,setImage]=useState(0); const [wish,setWish]=useState(false); const [wishBusy,setWishBusy]=useState(false); const [wishMsg,setWishMsg]=useState("");
 const [tab,setTab]=useState("description");
 const img=product.images[image]||product.images[0];
 async function toggleWishlist(){setWishBusy(true);setWishMsg("");try{const r=await fetch("/api/wishlist",{method:wish?"DELETE":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:product.id})});const d=await r.json();if(r.ok){setWish(!wish);setWishMsg(wish?"Removed from wishlist":"Saved to wishlist")}else setWishMsg(d.error||"Sign in to save this product");}catch{setWishMsg("Unable to update wishlist")}finally{setWishBusy(false)}}
 return <div className="product-experience">
  <div className="product-gallery">
   <div className="product-main-image-wrap">
    <button className="gallery-arrow left" onClick={()=>setImage((image-1+product.images.length)%product.images.length)} aria-label="Previous image">←</button>
    {img?<img className="product-main-image-real" src={img.url} alt={img.alt} />:<div className="product-image-placeholder">MOTEVRA</div>}
    <button className="gallery-arrow right" onClick={()=>setImage((image+1)%product.images.length)} aria-label="Next image">→</button>
    {product.images.length>1&&<span className="gallery-counter">{image+1} / {product.images.length}</span>}
   </div>
   {product.images.length>1&&<div className="product-thumbs" role="list">{product.images.map((x,i)=><button key={x.id} className={`product-thumb ${i===image?"active":""}`} onClick={()=>setImage(i)} aria-label={`View image ${i+1}`}><img src={x.url} alt="" /></button>)}</div>}
  </div>
  <div className="product-copy">
   <span className="product-brand">{product.brand}</span><h1>{product.name}</h1>
   {product.averageRating&&<div className="rating-line" aria-label={`${product.averageRating.toFixed(1)} out of 5 stars`}><span>{"★".repeat(Math.round(product.averageRating))}{"☆".repeat(5-Math.round(product.averageRating))}</span> <span>{product.averageRating.toFixed(1)} · {product.count} reviews</span></div>}
   <p className="price"><CurrencyPrice amount={product.price} from={product.currency}/></p>
   {product.tyre&&<p className="muted">Size <strong>{product.tyre.size}</strong> · Load {product.tyre.loadIndex??"—"} · Speed {product.tyre.speedRating??"—"}</p>}
   <p className="muted">{product.stock>0?product.stock+" units available":"Currently out of stock"}</p>
   <div className="product-buy-row"><AddToCartButton productId={product.id} stock={product.stock} variants={product.variants}/><button className={`wishlist-button ${wish?"active":""}`} onClick={toggleWishlist} disabled={wishBusy} aria-pressed={wish}>{wish?"♥":"♡"} <span>{wishBusy?"Saving…":wish?"Saved":"Wishlist"}</span></button></div>
   {wishMsg&&<small className="muted">{wishMsg}</small>}
   <div className="product-trust"><span>✓ Secure checkout</span><span>✓ Shipping options shown at checkout</span><span>✓ Order tracking</span></div>
   <div className="product-tabs" role="tablist">
    {["description","specifications","fitment","shipping","returns","reviews"].map(x=><button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x[0].toUpperCase()+x.slice(1)}</button>)}
   </div>
   <div className="product-tab-panel">
    {tab==="description"&&<div><h3>Product description</h3><p>{product.description||"Product details will be added as this catalogue record is completed."}</p></div>}
    {tab==="specifications"&&<Specs product={product}/>}
    {tab==="fitment"&&<Fitment fitments={product.fitments}/>}
    {tab==="shipping"&&<div><h3>Shipping</h3><p>Shipping availability, destination and cost are calculated during checkout. Heavy, tyre, wheel, battery and supplier products may have different delivery options.</p><a className="text-link" href="/shipping">View shipping information →</a></div>}
    {tab==="returns"&&<div><h3>Returns</h3><p>Return eligibility depends on the product and order. Review MOTEVRA's return terms before placing an order.</p><a className="text-link" href="/returns">View return information →</a></div>}
    {tab==="reviews"&&<Reviews reviews={product.reviews}/>}
   </div>
  </div>
 </div>
}
function Specs({product}:{product:Product}){const rows=[["Brand",product.brand],["Category",product.category],["Product type",product.productType.replace("_"," ")],["SKU",product.sku],...(product.tyre?[["Tyre size",product.tyre.size],["Load index",String(product.tyre.loadIndex??"—")],["Speed rating",product.tyre.speedRating||"—"],["Season",product.tyre.season?.replace("_"," ")||"—"],["Run-flat",product.tyre.runFlat?"Yes":"No"],["Warranty",product.tyre.warranty||"—"]]:[])];return <div className="spec-grid premium">{rows.map(([a,b])=><div className="spec" key={a}><span>{a}</span>{b}</div>)}</div>}
function Fitment({fitments}:{fitments:Product["fitments"]}){return fitments.length?<div className="fitment-list">{fitments.map((f,i)=><div className="fitment-item" key={i}><strong>{f.make} {f.model}</strong><span>{f.variant} · {f.yearFrom}{f.yearTo?"–"+f.yearTo:"+"}{f.engine?" · "+f.engine:""}</span>{f.notes&&<small>{f.notes}</small>}</div>)}</div>:<div><h3>Vehicle fitment</h3><p>Vehicle-specific fitment has not been added to this product yet. Confirm compatibility before ordering.</p></div>}
function Reviews({reviews}:{reviews:Review[]}){return reviews.length?<div className="reviews-list">{reviews.map(r=><article className="review-item" key={r.id}><div className="review-head"><strong>{r.name}</strong><span>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span></div>{r.title&&<h4>{r.title}</h4>}<p>{r.comment}</p><small>{new Date(r.createdAt).toLocaleDateString()}</small></article>)}</div>:<div><h3>No reviews yet</h3><p>Verified customer reviews will appear here after purchases are completed.</p></div>}
