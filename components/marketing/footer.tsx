import Link from "next/link";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "Tyres", href: "/tyres" },
      { label: "Wheels", href: "/wheels" },
      { label: "Accessories", href: "/accessories" },
      { label: "Deals", href: "/deals" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Journal", href: "/blog" },
      { label: "Track order", href: "/track-order" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Account", href: "/account" },
      { label: "Orders", href: "/account/orders" },
      { label: "Wishlist", href: "/account/wishlist" },
      { label: "Help centre", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316] text-sm font-black text-slate-950">
                M
              </div>
              <div className="text-lg font-black tracking-[0.22em] text-slate-900">MOTEVRA</div>
            </div>
            <p className="mt-4 max-w-sm text-base leading-7 text-slate-600">
              Premium mobility essentials for the modern driver, from performance tyres to international shipping confidence.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-slate-600">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition hover:text-slate-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 MOTEVRA. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/about">Privacy</Link>
            <Link href="/contact">Terms</Link>
            <Link href="/blog">Sustainability</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
