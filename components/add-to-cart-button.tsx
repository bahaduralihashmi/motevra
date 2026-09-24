"use client";

import { useState } from "react";

type Variant = {
  id: string;
  name: string | null;
  sku: string;
  price: number | null;
  stock: number;
  options: unknown;
};

export function AddToCartButton({
  productId,
  stock,
  variants = [],
}: {
  productId: string;
  stock: number;
  variants?: Variant[];
}) {
  const [variantId, setVariantId] = useState(variants.length ? variants[0].id : "");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const selected = variants.find((v) => v.id === variantId);
  const availableStock = selected?.stock ?? stock;

  async function add() {
    setBusy(true);
    setMsg("");
    const r = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, variantId: variantId || undefined, quantity }),
    });
    const d = await r.json();
    setMsg(r.ok ? "Added to bag" : d.error || "Unable to add");
    setBusy(false);
  }

  return (
    <div className="cart-action">
      {variants.length > 0 && (
        <label style={{ display: "grid", gap: 6, marginBottom: 10 }}>
          <span className="muted">Choose variant</span>
          <select value={variantId} onChange={(e) => { setVariantId(e.target.value); setQuantity(1); }}>
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock < 1}>
                {v.name || v.sku}{v.stock < 1 ? " — Out of stock" : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          aria-label="Quantity"
          type="number"
          min={1}
          max={Math.max(1, availableStock)}
          value={quantity}
          onChange={(e) => setQuantity(Math.min(Math.max(1, Number(e.target.value) || 1), Math.max(1, availableStock)))}
          style={{ width: 80 }}
        />
        <button className="button button-dark" disabled={busy || availableStock < 1} onClick={add}>
          {busy ? "Adding…" : availableStock < 1 ? "Out of stock" : "Add to bag"}
        </button>
      </div>
      {selected?.price != null && <small className="muted">Variant price: {selected.price.toFixed(2)}</small>}
      {msg && <small className="muted">{msg}</small>}
    </div>
  );
}