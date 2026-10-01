"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "MAIN",
    items: [{ label: "Dashboard", href: "/admin", icon: "▦" }],
  },
  {
    label: "CATALOG",
    items: [
      { label: "Products", href: "/admin/products", icon: "□" },
      { label: "Variants", href: "/admin/variants", icon: "◇" },
      { label: "Inventory", href: "/admin/inventory", icon: "▤" },
      { label: "Vehicle fitment", href: "/admin/fitment", icon: "⌁" },
    ],
  },
  {
    label: "ORDERS",
    items: [{ label: "Orders", href: "/admin#orders", icon: "◫" }],
  },
  {
    label: "SUPPLIERS",
    items: [
      { label: "Suppliers", href: "/admin/suppliers", icon: "◈" },
      { label: "Supplier catalog", href: "/admin/supplier-catalog", icon: "▥" },
      { label: "CJ imports", href: "/admin/cj", icon: "↥" },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Payment dashboard", href: "/admin/payments", icon: "¤" },
      { label: "Shipping & tax", href: "/admin/shipping", icon: "⌂" },
    ],
  },
];

type SearchItem = { label: string; meta?: string; href: string; type: string };

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);

  const navItems = useMemo(() => groups.flatMap((g) => g.items), []);
  const localResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return navItems
      .filter((item) => item.label.toLowerCase().includes(q))
      .map((item) => ({ ...item, type: "Navigation" }));
  }, [navItems, query]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/products"),
          fetch("/api/admin/orders"),
        ]);
        const next: SearchItem[] = [...localResults];
        if (productsRes.ok) {
          const data = await productsRes.json();
          for (const product of data.products ?? []) {
            const haystack = `${product.name} ${product.sku} ${product.source}`.toLowerCase();
            if (haystack.includes(q)) {
              next.push({
                label: product.name,
                meta: `${product.sku || "No SKU"} · ${product.source || "MOTEVRA"}`,
                href: "/admin/products",
                type: "Product",
              });
            }
          }
        }
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          for (const order of data.orders ?? []) {
            const haystack = `${order.number} ${order.guestName ?? ""} ${order.shippingName ?? ""} ${order.guestEmail ?? ""}`.toLowerCase();
            if (haystack.includes(q)) {
              next.push({
                label: order.number,
                meta: order.guestName || order.shippingName || "Customer order",
                href: "/admin#orders",
                type: "Order",
              });
            }
          }
        }
        const unique = next.filter((item, index, all) =>
          index === all.findIndex((other) => other.label === item.label && other.type === item.type),
        );
        setResults(unique.slice(0, 8));
      } catch {
        setResults(localResults);
      } finally {
        setSearching(false);
      }
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query, localResults]);

  const isActive = (href: string) => {
    const base = href.split("#")[0];
    return base === "/admin" ? pathname === "/admin" : pathname.startsWith(base);
  };

  function closeMobile() {
    setMobileOpen(false);
  }

  const sidebar = (
    <aside className={`admin-sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-mobile-open" : ""}`}>
      <div className="admin-sidebar-brand">
        <a href="/admin" onClick={closeMobile}>
          <strong>MOTEVRA</strong>
          <span>ADMIN</span>
        </a>
        <button type="button" className="admin-collapse" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <nav className="admin-nav" aria-label="Admin navigation">
        {groups.map((group) => (
          <div className="admin-nav-group" key={group.label}>
            <span className="admin-nav-label">{group.label}</span>
            {group.items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? "is-active" : ""}
                onClick={closeMobile}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-text">{item.label}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-bottom">
        <a href="/" onClick={closeMobile}><span className="admin-nav-icon">↗</span><span className="admin-nav-text">View storefront</span></a>
      </div>
    </aside>
  );

  return (
    <div className={`admin-app ${collapsed ? "sidebar-collapsed" : ""}`}>
      {sidebar}
      {mobileOpen && <button type="button" className="admin-mobile-backdrop" onClick={closeMobile} aria-label="Close navigation" />}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button type="button" className="admin-mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">☰</button>
            <div className="admin-search">
              <span>⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                placeholder="Search products, orders, SKU..."
                aria-label="Search admin"
              />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>}
              {query.trim().length >= 2 && (
                <div className="admin-search-results">
                  {searching && <div className="admin-search-empty">Searching…</div>}
                  {!searching && results.length === 0 && <div className="admin-search-empty">No matching products, orders or sections.</div>}
                  {!searching && results.map((item, index) => (
                    <a href={item.href} key={`${item.type}-${item.label}-${index}`} onClick={() => setQuery("")}>
                      <span className="admin-search-result-type">{item.type}</span>
                      <strong>{item.label}</strong>
                      {item.meta && <small>{item.meta}</small>}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="admin-topbar-actions">
            <a href="/" className="admin-store-link">View store ↗</a>
            <span className="admin-user-pill"><span className="admin-user-dot" /> Admin</span>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
