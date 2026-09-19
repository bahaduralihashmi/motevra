"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";

export function CartSummary() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const totalQty = useCartStore((state) => state.totalQty);

  return (
    <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Summary</div>
      <div className="mt-5 space-y-4 text-slate-700">
        <div className="flex items-center justify-between">
          <span>Items</span>
          <span>{totalQty}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>PKR {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>PKR {items.length ? 1250 : 0}</span>
        </div>
        <div className="border-t border-slate-200 pt-4 text-lg font-black text-slate-900">
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span>PKR {(subtotal + (items.length ? 1250 : 0)).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <Link href="/checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#f97316] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ea580c]">
        Proceed to checkout
      </Link>
    </aside>
  );
}
