import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AdminPayment = Prisma.PaymentGetPayload<{ include: { order: true } }>;

export default async function AdminPaymentsPage() {
  let payments: AdminPayment[] = [];
  if (process.env.DATABASE_URL) {
    try {
      payments = await db.payment.findMany({ include: { order: true }, orderBy: { createdAt: "desc" }, take: 50 });
    } catch {
      payments = [];
    }
  }

  return (
    <div>
      <div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Admin</p><h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Payments</h1></div>
      {!process.env.DATABASE_URL ? <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Connect PostgreSQL to view payment records.</div> : payments.length ? <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm"><table className="min-w-full text-left text-sm text-slate-700"><thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Method</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id} className="border-t border-slate-200"><td className="px-5 py-4 font-semibold text-slate-900">{payment.order.orderNumber}</td><td className="px-5 py-4">{payment.method}</td><td className="px-5 py-4">PKR {Number(payment.amount).toLocaleString()}</td><td className="px-5 py-4">{payment.status}</td></tr>)}</tbody></table></div> : <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No payments have been recorded yet.</div>}
    </div>
  );
}
