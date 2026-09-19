import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <Link href="/" className="brand">MOTEVRA</Link>
          <p>Everything your drive needs.</p>
          <p className="muted">Built for local commerce today and international expansion tomorrow.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/tyres">Tyres</Link>
          <Link href="/wheels">Wheels & Rims</Link>
          <Link href="/accessories">Accessories</Link>
          <Link href="/auto-parts">Auto Parts</Link>
        </div>
        <div>
          <h3>Support</h3>
          <Link href="/track-order">Track Order</Link>
          <Link href="/shipping">Shipping</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div>
          <h3>MOTEVRA</h3>
          <Link href="/about">About</Link>
          <Link href="/brands">Brands</Link>
          <Link href="/blog">Stories</Link>
          <Link href="/account">Account</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MOTEVRA. All rights reserved.</span>
        <span>Pakistan first · International-ready architecture</span>
      </div>
    </footer>
  );
}
