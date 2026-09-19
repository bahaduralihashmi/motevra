import Link from "next/link";
import { Search, ShoppingBag, User, Menu } from "lucide-react";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Tyres", href: "/tyres" },
  { label: "Wheels", href: "/wheels" },
  { label: "Accessories", href: "/accessories" },
  { label: "Deals", href: "/deals" },
  { label: "Brands", href: "/brands" },
  { label: "Journal", href: "/blog" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0d10]/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center gap-4">
          <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-3" aria-label="MOTEVRA home">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f97316] text-sm font-black text-slate-950">
              M
            </div>
            <div>
              <div className="text-lg font-black tracking-[0.24em] text-white">MOTEVRA</div>
            </div>
          </Link>

          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex w-full max-w-xl items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300">
              <Search className="h-4 w-4" />
              <input
                aria-label="Search products"
                placeholder="Search tyres, brands, vehicles..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
            <Link href="/account" className="inline-flex items-center gap-2 transition hover:text-white">
              <User className="h-4 w-4" />
              Account
            </Link>
            <Link href="/admin" className="transition hover:text-white">Admin</Link>
            <Link href="/account/orders" className="transition hover:text-white">Orders</Link>
            <Link href="/cart" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 transition hover:border-[#f97316]/60 hover:text-white">
              <ShoppingBag className="h-4 w-4" />
              Cart (2)
            </Link>
          </nav>
        </div>

        <nav className="hidden items-center justify-center gap-8 border-t border-white/8 py-3 text-sm text-slate-300 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
