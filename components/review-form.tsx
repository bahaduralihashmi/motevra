"use client";
import { useState } from "react";
export function ReviewForm({token,productId,productName}:{token:string;productId:string;productName:string}){
 const [rating,setRating]=useState(5),[title,setTitle]=useState(""),[comment,setComment]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");const r=await fetch("/api/reviews/token",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,productId,rating,title,comment})});const j=await r.json();if(!r.ok)setError(j.error||"Unable to submit review.");else setDone(true);setBusy(false)}
 if(done)return <div className="review-success"><h2>Thank you for your feedback.</h2><p>Your review was submitted for moderation and will appear after approval.</p></div>;
 return <form className="review-form" onSubmit={submit}><h2>{productName}</h2><label>Rating</label><div className="review-stars">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=rating?"active":""} onClick={()=>setRating(n)} aria-label={`${n} stars`}>★</button>)}</div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Review title (optional)"/><textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Tell us about quality, fit, delivery and satisfaction…" minLength={5} required/><button className="button button-dark" disabled={busy}>{busy?"Submitting…":"Submit review"}</button>{error&&<p className="admin-message">{error}</p>}</form>;
}
