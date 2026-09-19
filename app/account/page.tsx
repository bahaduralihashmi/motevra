import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">My account</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Welcome back, {session.user?.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Link href="/account/orders" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Orders</div>
          <div className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-900">03</div>
          <div className="mt-2 text-sm text-slate-600">View active and completed orders</div>
        </Link>

        <Link href="/account/wishlist" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Wishlist</div>
          <div className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-900">07</div>
          <div className="mt-2 text-sm text-slate-600">Saved products you want to revisit</div>
        </Link>

        <Link href="/account/vehicles" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Vehicles</div>
          <div className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-900">02</div>
          <div className="mt-2 text-sm text-slate-600">Saved profiles for fitment checks</div>
        </Link>

        <Link href="/account/payouts" className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Seller payouts</div>
          <div className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-900">IBAN</div>
          <div className="mt-2 text-sm text-slate-600">Manage bank and JazzCash details</div>
        </Link>
      </div>
    </div>
  );
}
