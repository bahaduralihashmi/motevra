"use client";
import { useEffect, useState } from "react";

type Make = { id: string; name: string; slug: string; models: { id: string; name: string; slug: string }[] };

export function TyreFinder() {
  const [makes, setMakes] = useState<Make[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [width, setWidth] = useState("");
  const [aspect, setAspect] = useState("");
  const [rim, setRim] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { fetch("/api/vehicles").then(r => r.json()).then(d => setMakes(d.makes ?? [])); }, []);
  const selected = makes.find(m => m.slug === make);
  async function find() {
    setMessage("Finding compatible tyres…");
    const params = make && model && year ? new URLSearchParams({ make, model, year }) : new URLSearchParams({ width, aspectRatio: aspect, rimSize: rim });
    const res = await fetch("/api/tyre-finder?" + params);
    const data = await res.json();
    setMessage(data.products?.length ? `${data.products.length} compatible tyre option(s) found.` : "No compatible tyres found in the current catalogue.");
  }
  return <div className="finder-card">
    <div><p className="eyebrow">TYRE FINDER</p><h2>Find the right fit.</h2><p>Search by vehicle or enter your tyre size.</p></div>
    <div className="finder-grid">
      <select value={make} onChange={e => { setMake(e.target.value); setModel(""); }}><option value="">Vehicle make</option>{makes.map(m => <option key={m.id} value={m.slug}>{m.name}</option>)}</select>
      <select value={model} onChange={e => setModel(e.target.value)} disabled={!selected}><option value="">Vehicle model</option>{selected?.models.map(m => <option key={m.id} value={m.slug}>{m.name}</option>)}</select>
      <input value={year} onChange={e => setYear(e.target.value)} placeholder="Year" inputMode="numeric" />
    </div>
    <div className="finder-divider">or by tyre size</div>
    <div className="finder-grid">
      <input value={width} onChange={e => setWidth(e.target.value)} placeholder="Width e.g. 205" inputMode="numeric" />
      <input value={aspect} onChange={e => setAspect(e.target.value)} placeholder="Aspect e.g. 55" inputMode="numeric" />
      <input value={rim} onChange={e => setRim(e.target.value)} placeholder="Rim e.g. 16" inputMode="numeric" />
    </div>
    <button className="button button-dark" type="button" onClick={find}>Find compatible tyres</button>
    {message && <p className="finder-message">{message}</p>}
  </div>;
}
