import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CurrencyPrice } from "@/components/currency-price";

export const runtime = "nodejs";
export default async function OrdersPage() {
  const s = await auth();
  if (!s?.user?.email) redirect("/signin");

  type OrderWithItems = Awaited<ReturnType<ReturnType<typeof getPrisma>["order"]["findMany"]>>[number] & {
    items: Array<{ quantity: number; product: { name: string } }>;
  };
  let orders: OrderWithItems[] = [];
  let databaseError = false;
  try {
    if (!process.env.DATABASE_URL) databaseError = true;
    else {
      const p = getPrisma();
      const user = await p.user.findUnique({ where: { email: s.user.email }, select: { id: true } });
      orders = user ? await p.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: { include: { product: true } } } }) : [];
    }
  } catch { databaseError = true; }

  return <><SiteHeader /><main><section className="page-hero"><div className="container narrow">
    <p className="eyebrow">YOUR ORDERS</p><h1>Order history.</h1>
    {databaseError ? <p className="hero-copy">Order history is temporarily unavailable while the commerce database is being connected.</p> :
      <div className="order-list">{orders.map(o => <article className="order-card" key={o.id}><strong>{o.number}</strong><span>{o.status.replaceAll("_", " ")} · <CurrencyPrice amount={Number(o.total)} from={o.currency} /></span><small>{o.items.map(i => `${i.product.name} × ${i.quantity}`).join(" · ")}</small></article>)}{!orders.length && <p className="hero-copy">No orders yet.</p>}</div>}
  </div></section></main><SiteFooter /></>;
}