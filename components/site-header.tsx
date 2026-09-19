"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  ["Tyres", "/tyres"],
  ["Wheels & Rims", "/wheels"],
  ["Accessories", "/accessories"],
  ["Auto Parts", "/auto-parts"],
  ["Batteries", "/batteries"],
  ["Car Care", "/car-care"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="header-inner">
        <button className="mobile-menu" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span /><span /><span />
        </button>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>MOTEVRA</Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/shop" aria-label="Search products">⌕ <span className="header-action-label">Search</span></Link>
          <Link className="desktop-account" href="/account">Account</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </div>
      <div className={`mobile-nav-backdrop${open ? " is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`mobile-nav${open ? " is-open" : ""}`} aria-label="Mobile navigation">
        <div className="mobile-nav-head"><strong>SHOP MOTEVRA</strong><button type="button" onClick={() => setOpen(false)} aria-label="Close menu">×</button></div>
        <nav>
          {nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}><span>{label}</span><span>→</span></Link>)}
        </nav>
        <div className="mobile-nav-secondary">
          <Link href="/shop" onClick={() => setOpen(false)}>Search products</Link>
          <Link href="/account" onClick={() => setOpen(false)}>Account</Link>
          <Link href="/orders" onClick={() => setOpen(false)}>Orders</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>Cart</Link>
        </div>
      </aside>
    </header>
  );
}
