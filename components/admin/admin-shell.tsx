import Link from "next/link";

const navItems = [
  { label: "Overview", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Analytics", href: "/admin/analytics" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 w-72 border-r border-slate-200 bg-slate-950 p-6 text-white">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316] text-sm font-black text-slate-950">M</div>
          <div className="text-lg font-black tracking-[0.22em]">MOTEVRA</div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="ml-72 min-h-screen p-8">{children}</main>
    </div>
  );
}
