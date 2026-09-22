"use client";

import Link from "next/link";
import { useState } from "react";

export function NewestProductActions({ productId, href }: { productId?: string; href: string }) {
  const [busy, setBusy] = useState(false);

  async function buyNow() {
    if (!productId || busy) return;
    setBusy(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!response.ok) throw new Error("Unable to add product");
      window.location.href = "/checkout";
    } catch {
      setBusy(false);
    }
  }

  return (
    <div className="newest-product-actions">
      <button className="button button-dark" onClick={buyNow} disabled={busy || !productId}>
        {busy ? "Adding…" : "Buy now"}
      </button>
      <Link className="button button-light" href={href}>
        View product
      </Link>
    </div>
  );
}
