"use client";
import { useEffect,useState } from "react";
type Review={id:string;rating:number;title?:string|null;comment:string;createdAt:string;user?:{name?:string|null}|null};
export function ProductReviews({productId}:{productId:string}){
 const [reviews,setReviews]=useState<Review[]>([]),[rating,setRating]=useState(0),[count,setCount]=useState(0);
 useEffect(()=>{fetch("/api/reviews?productId="+encodeURIComponent(productId)).then(r=>r.json()).then(j=>{setReviews(j.reviews||[]);setRating(Number(j.rating||0));setCount(Number(j.count||0))}).catch(()=>{})},[productId]);
 return <section className="product-reviews"><div className="section-heading"><div><p className="eyebrow">CUSTOMER FEEDBACK</p><h2>Verified reviews</h2></div><div className="review-summary"><strong>{rating?rating.toFixed(1):"—"}</strong><span>{"★".repeat(Math.round(rating))}{"☆".repeat(5-Math.round(rating))}<br/><small>{count} verified review{count===1?"":"s"}</small></span></div></div>{reviews.length===0?<p className="muted">No approved reviews yet. Be the first verified customer to share your experience.</p>:reviews.map(r=><article className="review-card" key={r.id}><div className="stars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</div><h3>{r.title||"Verified purchase"}</h3><p>{r.comment}</p><small>Verified purchase · {r.user?.name||"MOTEVRA customer"} · {new Date(r.createdAt).toLocaleDateString()}</small></article>)}</section>;
}
