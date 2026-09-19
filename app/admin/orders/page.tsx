import { db } from "@/lib/db";
import { updateOrderStatus } from "@/app/actions/order-status";
import type { Prisma } from "@prisma/client";

type AdminOrder = Prisma.OrderGetPayload<{ include: { user: true; payments: true } }>;

export default async function AdminOrdersPage() {
  let orders: AdminOrder[] = [];
  if (process.env.DATABASE_URL) {
    try {
      orders = await db.order.findMany({ include: { user: true, payments: true }, orderBy: { createdAt: "desc" }, take: 50 });
    } catch {
      orders = [];
    }
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Orders</h1>
      </div>

      {!process.env.DATABASE_URL ? (
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Connect PostgreSQL to view real orders.</div>
      ) : orders.length ? (
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Status</th></tr></thead>
            <tbody>{orders.map((order) => { const payment = order.payments[0]; return <tr key={order.id} className="border-t border-slate-200"><td className="px-5 py-4 font-semibold text-slate-900">{order.orderNumber}</td><td className="px-5 py-4">{order.user?.email ?? order.customerEmail ?? "Guest checkout"}</td><td className="px-5 py-4">PKR {Number(order.total).toLocaleString()}</td><td className="px-5 py-4">{payment ? `${payment.method} / ${payment.status}` : "Not recorded"}</td><td className="px-5 py-4"><form action={updateOrderStatus} className="flex gap-2"><input type="hidden" name="orderId" value={order.id} /><select name="status" defaultValue={order.status} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs"><option value="PENDING">Pending</option><option value="PROCESSING">Processing</option><option value="PACKED">Packed</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select><button className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold">Update</button></form></td></tr>; })}</tbody>
          </table>
        </div>
      ) : <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No orders have been placed yet.</div>}
    </div>
  );
}
