"use client";

import { useCartStore } from "@/lib/store/cart-store";

export function CartItems() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQty = useCartStore((state) => state.updateQty);

  if (!items.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
          <img src={item.image} alt={item.name} className="h-28 w-28 rounded-[1rem] object-cover" />
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{item.brand}</div>
              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-900">{item.name}</h2>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                <button type="button" onClick={() => updateQty(item.id, item.qty - 1)} className="h-7 w-7 rounded-full bg-white text-lg text-slate-900">
                  −
                </button>
                <span className="min-w-6 text-center font-medium text-slate-900">{item.qty}</span>
                <button type="button" onClick={() => updateQty(item.id, item.qty + 1)} className="h-7 w-7 rounded-full bg-white text-lg text-slate-900">
                  +
                </button>
              </div>

              <div className="text-lg font-black text-slate-900">
                PKR {(item.salePrice * item.qty).toLocaleString()}
              </div>
            </div>
          </div>

          <button type="button" onClick={() => removeItem(item.id)} className="self-start text-sm text-slate-500 hover:text-slate-900">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
