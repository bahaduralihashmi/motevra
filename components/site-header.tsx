"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { currencies, useCurrency, type CurrencyCode } from "@/components/currency-provider";

const nav = [
  {
    label: "Tyres",
    href: "/tyres",
    groups: [
      { title: "Shop by brand", items: ["Autogrip", "Michelin", "Bridgestone", "Chinese Tyre Brands", "Continental", "Goodyear", "Pirelli", "Yokohama"] },
      { title: "Shop by type", items: ["Summer Tyres", "All-Season Tyres", "Winter Tyres", "Performance Tyres", "SUV & 4x4 Tyres", "Run-Flat Tyres"] },
      { title: "Shop by size", items: ["14 inch", "15 inch", "16 inch", "17 inch", "18 inch", "19 inch+"] },
    ],
  },
  {
    label: "Wheels & Rims",
    href: "/wheels",
    groups: [
      { title: "Shop by brand", items: ["BBS", "OZ Racing", "Enkei", "Borbet", "RAYS", "Rotiform"] },
      { title: "Shop by style", items: ["Alloy Wheels", "Performance Wheels", "Luxury Wheels", "Off-Road Wheels", "Steel Wheels"] },
      { title: "Shop by size", items: ["15 inch", "16 inch", "17 inch", "18 inch", "19 inch", "20 inch+"] },
    ],
  },
  {
    label: "Accessories",
    href: "/accessories",
    groups: [
      { title: "Popular", items: ["Floor Mats", "Seat Covers", "LED Lighting", "Dash Cameras", "Phone Mounts", "Car Organizers"] },
      { title: "Interior", items: ["Mats & Liners", "Seat Covers", "Interior Lighting", "Electronics"] },
      { title: "Exterior", items: ["Exterior Styling", "Sun Shades", "Number Plate Frames", "Protection"] },
    ],
  },
  {
    label: "Auto Parts",
    href: "/auto-parts",
    groups: [
      { title: "Shop by system", items: ["Brakes", "Suspension", "Engine", "Electrical", "Filters", "Cooling"] },
      { title: "Popular parts", items: ["Brake Pads", "Brake Discs", "Air Filters", "Oil Filters", "Spark Plugs", "Wipers"] },
      { title: "Shop by vehicle", items: ["Toyota", "Honda", "Suzuki", "Kia", "Hyundai", "BMW"] },
    ],
  },
  {
    label: "Batteries",
    href: "/batteries",
    groups: [
      { title: "Shop by brand", items: ["Exide", "AGS", "Osaka", "Volta", "Atlas", "Phoenix"] },
      { title: "Shop by type", items: ["Maintenance-Free", "Lead Acid", "AGM", "EFB", "Deep Cycle"] },
      { title: "Shop by capacity", items: ["35–45 Ah", "46–60 Ah", "61–75 Ah", "76–100 Ah", "100 Ah+"] },
    ],
  },
  {
    label: "Car Care",
    href: "/car-care",
    groups: [
      { title: "Exterior care", items: ["Car Shampoo", "Wax & Polish", "Tyre Care", "Glass Care", "Detailing Tools"] },
      { title: "Interior care", items: ["Interior Cleaners", "Leather Care", "Dashboard Care", "Air Fresheners"] },
      { title: "Brands", items: ["Meguiar's", "Turtle Wax", "Mothers", "Sonax", "3M"] },
    ],
  },
] as const;

const navItemHref = (categoryHref: string, item: string) => item === "Autogrip" ? "/brands/autogrip" : item === "Chinese Tyre Brands" ? "/tyres/chinese-tyre-brands" : `${categoryHref}?filter=${encodeURIComponent(item)}`;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { currency, setCurrency } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48);
      setHovered(null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const loadCartCount = async () => {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        const data = await response.json();
        const count = data?.cart?.items?.reduce((total: number, item: { quantity: number }) => total + Number(item.quantity || 0), 0) || 0;
        if (!cancelled) setCartCount(count);
      } catch {}
    };
    loadCartCount();
    const onCartChanged = () => loadCartCount();
    window.addEventListener("motevra:cart-updated", onCartChanged);
    return () => {
      cancelled = true;
      window.removeEventListener("motevra:cart-updated", onCartChanged);
    };
  }, []);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = searchQuery.trim();
    if (value) window.location.href = "/shop?q=" + encodeURIComponent(value);
    else window.location.href = "/shop";
    setSearchOpen(false);
  };

  const closeMenus = () => {
    setOpen(false);
    setHovered(null);
    setCurrencyOpen(false);
  };

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="header-inner">
        <button className="mobile-menu" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span /><span /><span />
        </button>

        <Link href="/" className="brand" onClick={closeMenus}>MOTEVRA</Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map((category) => (
            <div
              className="nav-mega-item"
              key={category.href}
              onMouseEnter={() => setHovered(category.href)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link href={category.href} className="nav-mega-trigger" aria-haspopup="true" aria-expanded={hovered === category.href}>
                {category.label}
                <span className="nav-chevron">⌄</span>
              </Link>

              <div className={`mega-menu${hovered === category.href ? " is-open" : ""}`}>
                <div className="mega-menu-inner">
                  <div className="mega-menu-intro">
                    <span className="mega-kicker">MOTEVRA / {category.label}</span>
                    <strong>{category.label}</strong>
                    <Link href={category.href} onClick={closeMenus}>Shop all {category.label} →</Link>
                  </div>
                  {category.groups.map((group) => (
                    <div className="mega-group" key={group.title}>
                      <span>{group.title}</span>
                      {group.items.map((item) => (
                        <Link key={item} href={navItemHref(category.href, item)} onClick={closeMenus}>
                          {item}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <button className="header-search-button" type="button" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen((value) => !value)}>⌕ <span className="header-action-label">Search</span></button>
          <Link className="desktop-account" href="/account">Account</Link>
          <Link className="header-cart" href="/cart" aria-label={cartCount ? `Shopping cart, ${cartCount} items` : "Shopping cart"}><span className="header-cart-icon" aria-hidden="true">🛒</span><span className="header-action-label">Cart</span>{cartCount > 0 && <span className="cart-count" aria-label={`${cartCount} items in cart`}>{cartCount > 99 ? "99+" : cartCount}</span>}</Link>
          <div className="currency-picker" onMouseLeave={() => setCurrencyOpen(false)}>
            <button className="currency-trigger" type="button" aria-haspopup="listbox" aria-expanded={currencyOpen} onClick={() => setCurrencyOpen((value) => !value)}>
              {currency} <span>⌄</span>
            </button>
            <div className={`currency-menu${currencyOpen ? " is-open" : ""}`} role="listbox" aria-label="Choose currency">
              {currencies.map((item) => (
                <button key={item.code} type="button" role="option" aria-selected={currency === item.code} className={currency === item.code ? "active" : ""} onClick={() => { setCurrency(item.code as CurrencyCode); setCurrencyOpen(false); }}>
                  <span>{item.flag}</span><span>{item.name}</span><strong>{item.code}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={`header-search-panel${searchOpen ? " is-open" : ""}`} aria-hidden={!searchOpen}>
        <form className="header-search-form" onSubmit={submitSearch}>
          <label htmlFor="global-search">Search MOTEVRA</label>
          <div className="header-search-input-wrap">
            <input id="global-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tyres, wheels, parts, brands or SKU…" autoComplete="off" autoFocus={searchOpen} />
            <button type="submit">Search</button>
          </div>
          <div className="header-search-links">
            <span>Quick search</span>
            <Link href="/tyres" onClick={closeMenus}>Tyres</Link>
            <Link href="/wheels" onClick={closeMenus}>Wheels</Link>
            <Link href="/auto-parts" onClick={closeMenus}>Auto parts</Link>
            <Link href="/accessories" onClick={closeMenus}>Accessories</Link>
          </div>
        </form>
      </div>

      <div className={`mobile-nav-backdrop${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside className={`mobile-nav${open ? " is-open" : ""}`} aria-label="Mobile navigation">
        <div className="mobile-nav-head"><strong>SHOP MOTEVRA</strong><button type="button" onClick={() => setOpen(false)} aria-label="Close menu">×</button></div>
        <nav>
          {nav.map((category) => (
            <div className="mobile-category" key={category.href}>
              <Link href={category.href} onClick={() => setOpen(false)}>
                <span>{category.label}</span><span>→</span>
              </Link>
              <div className="mobile-category-links">
                {category.groups.flatMap((group) => group.items.slice(0, category.label === "Tyres" ? 4 : 3)).map((item) => (
                  <Link key={item} href={navItemHref(category.href, item)} onClick={() => setOpen(false)}>{item}</Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mobile-currency-row"><span>Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)} aria-label="Choose currency">{currencies.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.code} — {item.name}</option>)}</select></div>
        <div className="mobile-nav-secondary">
          <button className="mobile-search-launch" type="button" onClick={() => { setOpen(false); setSearchOpen(true); }}>Search products</button>
          <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
          <Link href="/orders" onClick={() => setOpen(false)}>Orders</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>
        </div>
      </aside>
    </header>
  );
}
