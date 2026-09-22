import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { ReviewForm } from "@/components/review-form";
export const dynamic="force-dynamic";
export default async function ReviewPage({params}:{params:Promise<{token:string}>}){
  const {token}=await params;
  const r=await getPrisma().reviewRequest.findUnique({where:{token},include:{product:{include:{images:{orderBy:{position:"asc"},take:1}}}}});
  if(!r||r.usedAt||r.expiresAt<new Date())notFound();
  return <main className="section"><div className="container narrow"><p className="eyebrow">MOTEVRA VERIFIED PURCHASE</p><h1>How was your purchase?</h1><p className="hero-copy">{r.product.name}</p><ReviewForm token={token} productId={r.productId} productName={r.product.name}/></div></main>;
}
