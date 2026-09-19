import Image from "next/image";
import { ArrowRight, Gauge, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustPoints = [
  { icon: Gauge, label: "Tyre fitment sync" },
  { icon: ShieldCheck, label: "Premium brands" },
  { icon: Truck, label: "Global delivery" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b0d10]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.32),transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.18),transparent_25%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-20">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#fed7aa]">
            Premium tyre performance
          </div>

          <h1 className="max-w-xl text-4xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
            Drive the road ahead.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Precision-fit tyres, premium wheels, and performance essentials for drivers that expect more from every mile.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button href="/shop" className="w-full sm:w-auto">Shop Tyres</Button>
            <Button href="/tyres" variant="ghost" className="w-full sm:w-auto">
              Find My Tyres
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 text-sm text-slate-300">
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Icon className="h-4 w-4 text-[#f97316]" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#f97316]/30 via-transparent to-[#38bdf8]/25 blur-3xl" />
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-3 shadow-[0_35px_90px_rgba(15,23,42,0.7)]">
            <div className="overflow-hidden rounded-[1.5rem] bg-[#f3f4f6]">
              <Image
                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80"
                alt="Premium tyre and wheel detail"
                width={1200}
                height={1600}
                priority
                className="h-[560px] w-full object-cover"
              />
            </div>
            <div className="absolute bottom-8 left-8 rounded-2xl border border-white/10 bg-[#0b0d10]/75 p-4 text-white shadow-2xl backdrop-blur-md">
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Featured fitment</div>
              <div className="mt-2 text-2xl font-black tracking-[-0.06em]">205 / 55 / R16</div>
              <div className="mt-1 text-sm text-slate-300">Toyota Corolla 2020 • 1.6</div>
            </div>
            <div className="absolute right-8 top-8 rounded-2xl border border-[#f97316]/20 bg-[#111827]/90 p-4 text-sm text-slate-200 shadow-2xl">
              <div className="flex items-center gap-2 text-[#fbbf24]">
                <ArrowRight className="h-4 w-4" />
                4.9/5 driver rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
