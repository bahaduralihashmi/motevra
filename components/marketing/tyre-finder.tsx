"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";

const vehicleExamples = [
  ["Toyota", "Corolla"],
  ["Honda", "Civic"],
  ["BMW", "3 Series"],
  ["Audi", "A4"],
];

export function TyreFinder() {
  const [width, setWidth] = useState("205");
  const [aspect, setAspect] = useState("55");
  const [rim, setRim] = useState("16");
  const [manufacturer, setManufacturer] = useState("Toyota");
  const [model, setModel] = useState("Corolla");

  const resultHref = `/tyres?width=${width}&aspect=${aspect}&rim=${rim}&manufacturer=${encodeURIComponent(manufacturer)}&model=${encodeURIComponent(model)}`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-[#0f172a] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:p-8 lg:p-10">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#fbbf24]">Tyre finder</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.06em] text-white sm:text-4xl">Find the right fit, instantly.</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#f97316]/20 bg-[#f97316]/10 px-3 py-2 text-sm text-[#fed7aa]"><Search className="h-4 w-4" /> Compatibility search</div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Search by tyre size</div>
            <div className="grid grid-cols-3 gap-3">
              {[['Width', width, setWidth], ['Aspect', aspect, setAspect], ['Rim', rim, setRim]].map(([label, value, setter]) => (
                <label key={label as string} className="rounded-xl border border-white/10 bg-[#111827] p-3 text-center">
                  <span className="block text-xs uppercase tracking-[0.2em] text-slate-400">{label as string}</span>
                  <input value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="mt-2 w-full bg-transparent text-center text-xl font-black text-white outline-none" inputMode="numeric" />
                </label>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-300">Example: {width} / {aspect} / R{rim}</div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Search by vehicle</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={manufacturer} onChange={(event) => setManufacturer(event.target.value)} placeholder="Manufacturer" className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-slate-100 outline-none" />
              <input value={model} onChange={(event) => setModel(event.target.value)} placeholder="Model" className="rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-slate-100 outline-none" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {vehicleExamples.map(([exampleManufacturer, exampleModel]) => (
                <button key={`${exampleManufacturer}-${exampleModel}`} type="button" onClick={() => { setManufacturer(exampleManufacturer); setModel(exampleModel); }} className="rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-left text-sm text-slate-300 hover:border-[#f97316]/60 hover:text-white">{exampleManufacturer} {exampleModel}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center"><Link href={resultHref} className="inline-flex w-full items-center justify-center rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#ea580c] sm:w-auto">Find compatible tyres</Link></div>
      </div>
    </section>
  );
}
