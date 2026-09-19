import { Button } from "@/components/ui/button";

export function ShippingNewsletter() {
  return (
    <section className="bg-[#f8fafc] py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f97316]">International shipping</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-slate-900">Fast, reliable delivery worldwide.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            From regional fulfilment hubs to cross-border shipping, MOTEVRA is designed for global expansion with the reliability of local inventory and transparent delivery timelines.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="text-2xl font-black tracking-[-0.06em] text-slate-900">45+</div>
              <div className="mt-1 text-sm text-slate-600">countries</div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="text-2xl font-black tracking-[-0.06em] text-slate-900">48h</div>
              <div className="mt-1 text-sm text-slate-600">dispatch</div>
            </div>
            <div className="rounded-2xl bg-slate-100 p-4">
              <div className="text-2xl font-black tracking-[-0.06em] text-slate-900">24/7</div>
              <div className="mt-1 text-sm text-slate-600">tracking</div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[#0b0d10] p-8 text-white shadow-[0_25px_70px_rgba(15,23,42,0.3)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#fbbf24]">Newsletter</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.06em]">Never miss a premium drop.</h3>
          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-3 text-base text-white placeholder:text-slate-400 focus:outline-none"
            />
            <Button href="/shop" className="w-full justify-center">Join now</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
