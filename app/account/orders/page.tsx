import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type CustomerOrder = Prisma.OrderGetPayload<{ include: { payments: true; items: true } }>;

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  let orders: CustomerOrder[] = [];
  if (process.env.DATABASE_URL) {
    try {
      orders = await db.order.findMany({ where: { userId: session.user.id }, include: { payments: true, items: true }, orderBy: { createdAt: "desc" } });
    } catch {
      orders = [];
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">My account</p><h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Order history</h1></div>
      {!process.env.DATABASE_URL ? <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Connect PostgreSQL to view your persisted orders.</div> : orders.length ? <div className="space-y-4">{orders.map((order) => { const payment = order.payments[0]; return <article key={order.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">{order.orderNumber}</div><h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-slate-900">PKR {Number(order.total).toLocaleString()}</h2></div><div className="text-left text-sm text-slate-600 sm:text-right"><div>{order.status}</div><div>{payment?.method ?? "Payment pending"} · {payment?.status ?? "pending"}</div></div></div><div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600">{order.items.map((item) => <div key={item.id}>{item.name} × {item.quantity}</div>)}</div></article>; })}</div> : <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">You have not placed any orders yet.</div>}
    </div>
  );
}
