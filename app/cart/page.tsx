import { CartItems } from "@/components/store/cart-items";
import { CartSummary } from "@/components/store/cart-summary";

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Cart</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Your order</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <CartItems />
        <CartSummary />
      </div>
    </div>
  );
}
