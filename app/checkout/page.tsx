import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPrisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout-form";

export const runtime = "nodejs";
export default async function CheckoutPage() {
  const s = await auth();
  if (!s?.user?.email) redirect("/signin");

  let cart: any = null;
  let databaseError = false;
  try {
    if (!process.env.DATABASE_URL) databaseError = true;
    else {
      const p = getPrisma();
      const user = await p.user.findUnique({ where: { email: s.user.email }, include: { carts: { where: { status: "ACTIVE" }, include: { items: { include: { product: true } } }, take: 1 } } });
      cart = user?.carts[0] ?? null;
    }
  } catch { databaseError = true; }

  return <><SiteHeader /><main><section className="page-hero"><div className="container narrow">
    <p className="eyebrow">CHECKOUT</p><h1>Complete your order.</h1>
    {databaseError ? <p className="hero-copy">Checkout is temporarily unavailable while the commerce database is being connected.</p> :
      cart?.items.length ? <CheckoutForm total={cart.items.reduce((n: number, i: any) => n + Number(i.unitPrice) * i.quantity, 0)} currency={cart.currency} /> :
      <><p className="hero-copy">Your cart is empty.</p><a className="button button-dark" href="/shop">Shop products</a></>}
  </div></section></main><SiteFooter /></>;
}