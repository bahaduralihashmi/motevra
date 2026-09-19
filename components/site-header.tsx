import Link from "next/link";

const nav = [
  ["Tyres", "/tyres"],
  ["Wheels & Rims", "/wheels"],
  ["Accessories", "/accessories"],
  ["Auto Parts", "/auto-parts"],
  ["Batteries", "/batteries"],
  ["Car Care", "/car-care"],
  ["Deals", "/deals"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="MOTEVRA home">
          MOTEVRA
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {nav.map(([label, href]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/shop" aria-label="Search products">Search</Link>
          <Link href="/account">Account</Link>
          <Link href="/cart">Cart</Link>
        </div>
      </div>
    </header>
  );
}
