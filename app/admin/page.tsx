import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Admin console</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">MOTEVRA operations</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Products", "1,240"],
          ["Orders", "432"],
          ["Inventory", "86%"],
          ["Revenue", "PKR 8.7M"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
            <div className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-900">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
