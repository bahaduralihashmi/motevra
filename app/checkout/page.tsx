"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { createOrder, type CreateOrderResult } from "@/app/actions/orders";
import { useCartStore } from "@/lib/store/cart-store";

const initialState: CreateOrderResult | null = null;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const clear = useCartStore((state) => state.clear);
  const shipping = items.length ? 1250 : 0;
  const total = subtotal + shipping;
  const [state, formAction, isPending] = useActionState(createOrder, initialState);

  useEffect(() => {
    if (state?.ok) {
      clear();
    }
  }, [clear, state]);

  if (state?.ok) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Order confirmed</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Thanks for your order.</h1>
        <p className="mt-4 text-slate-600">Your order number is {state.orderNumber}. We will contact you with delivery details.</p>
        <Link href="/shop" className="mt-8 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Checkout</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Complete your order</h1>
      </div>

      {!items.length ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link href="/shop" className="mt-5 inline-flex rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white">
            Browse products
          </Link>
        </div>
      ) : (
        <form action={formAction} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <input type="hidden" name="items" value={JSON.stringify(items.map((item) => ({ id: item.id, qty: item.qty })))} />
          <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Delivery details</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input name="fullName" required placeholder="Full name" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
                <input name="email" required type="email" placeholder="Email address" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
                <input name="phone" required placeholder="Phone number" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3" />
                <input name="city" required placeholder="City" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2" />
                <input name="streetAddress" required placeholder="Street address" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2" />
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Payment method</div>
              <div className="mt-4 grid gap-3">
                {[
                  ["CASH_ON_DELIVERY", "Cash on Delivery"],
                  ["BANK_TRANSFER", "Bank Transfer"],
                  ["EASYPISA", "Easypaisa"],
                  ["JAZZCASH", "JazzCash"],
                ].map(([value, label], index) => (
                  <label key={value} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700">
                    <input type="radio" name="paymentMethod" value={value} defaultChecked={index === 0} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Summary</div>
            <div className="mt-5 space-y-4 text-slate-700">
              {items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-4">
                  <span>{item.name} x{item.qty}</span>
                  <span className="whitespace-nowrap">PKR {(item.salePrice * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>PKR {shipping.toLocaleString()}</span>
              </div>
              <div className="border-t border-slate-200 pt-4 text-lg font-black text-slate-900">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {state && !state.ok ? <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.message}</p> : null}
            <button disabled={isPending} className="mt-6 w-full rounded-full bg-[#f97316] px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-60">
              {isPending ? "Placing order..." : "Place order"}
            </button>
          </aside>
        </form>
      )}
    </div>
  );
}
