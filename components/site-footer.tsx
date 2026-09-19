import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="brand">MOTEVRA</Link>
          <p>Everything your drive needs.</p>
          <p className="muted">A modern automotive marketplace for tyres, wheels, parts and future accessories.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/tyres">Tyres</Link>
          <Link href="/wheels">Wheels & Rims</Link>
          <Link href="/accessories">Accessories</Link>
          <Link href="/auto-parts">Auto Parts</Link>
          <Link href="/batteries">Batteries</Link>
          <Link href="/car-care">Car Care</Link>
        </div>
        <div>
          <h3>Support</h3>
          <Link href="/shipping">Shipping</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/account">Account</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/cart">Cart</Link>
        </div>
        <div>
          <h3>MOTEVRA</h3>
          <Link href="/about">About</Link>
          <Link href="/shop">Shop all</Link>
          <Link href="/tyres">Find tyres</Link>
          <Link href="/contact">Get in touch</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MOTEVRA. All rights reserved.</span>
        <span>Pakistan first · International expansion planned</span>
      </div>
    </footer>
  );
}
