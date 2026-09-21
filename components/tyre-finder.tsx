"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Make = { id: string; name: string; slug: string; models: { id: string; name: string; slug: string }[] };

const sizes = ["175/65 R14","185/65 R15","195/65 R15","205/55 R16","215/60 R17","225/45 R17","235/55 R18","245/45 R18","265/65 R17"];

export function TyreFinder() {
  const [mode, setMode] = useState<"vehicle" | "size">("vehicle");
  const [makes, setMakes] = useState<Make[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [size, setSize] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/vehicles").then(r => r.json()).then(d => setMakes(d.makes ?? [])).catch(() => setMakes([]));
  }, []);

  const selected = makes.find(m => m.slug === make);

  function selectMode(next: "vehicle" | "size") {
    setMode(next);
    setMessage("");
  }

  function search() {
    const params = new URLSearchParams();

    if (mode === "size") {
      const match = size.match(/^(\d+)\/(\d+)\s+R(\d+)$/);
      if (!match) {
        setMessage("Please select a tyre size.");
        return;
      }
      params.set("width", match[1]);
      params.set("aspectRatio", match[2]);
      params.set("rimSize", match[3]);
    } else {
      if (!make || !model || !year) {
        setMessage("Please select make, model and year.");
        return;
      }
      params.set("make", make);
      params.set("model", model);
      params.set("year", year);
    }

    setMessage("Finding compatible tyres…");
    fetch("/api/tyre-finder?" + params.toString())
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Search failed");
        return data;
      })
      .then(data => setMessage(data.products?.length ? `${data.products.length} compatible tyre option(s) found.` : "No compatible tyres found in the current catalogue."))
      .catch(() => setMessage("Tyre catalogue is unavailable right now. Please try again."));
  }

  return (
    <div className="finder-panel">
      <div className="finder-tabs">
        <button type="button" className={`finder-tab${mode === "vehicle" ? " active" : ""}`} onClick={() => selectMode("vehicle")}>By vehicle</button>
        <button type="button" className={`finder-tab${mode === "size" ? " active" : ""}`} onClick={() => selectMode("size")}>By size</button>
      </div>

      {mode === "vehicle" ? (
        <div className="finder-fields">
          <select value={make} onChange={e => { setMake(e.target.value); setModel(""); setMessage(""); }} aria-label="Vehicle make">
            <option value="">Make</option>
            {makes.map(m => <option key={m.id} value={m.slug}>{m.name}</option>)}
          </select>
          <select value={model} onChange={e => { setModel(e.target.value); setMessage(""); }} disabled={!selected} aria-label="Vehicle model">
            <option value="">Model</option>
            {selected?.models.map(m => <option key={m.id} value={m.slug}>{m.name}</option>)}
          </select>
          <select value={year} onChange={e => { setYear(e.target.value); setMessage(""); }} aria-label="Vehicle year">
            <option value="">Year</option>
            {Array.from({ length: 12 }, (_, i) => 2026 - i).map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
      ) : (
        <div className="finder-fields">
          <select value={size} onChange={e => { setSize(e.target.value); setMessage(""); }} aria-label="Tyre size">
            <option value="">Tyre size</option>
            {sizes.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      )}

      <button className="button button-accent" type="button" onClick={search}>
        {mode === "size" ? "Find tyres by size" : "Find compatible tyres"}
      </button>

      {message && <p className="finder-message">{message}</p>}
      {mode === "size" && size && message.includes("found") ? (
        <Link className="finder-results-link" href={`/tyres?size=${encodeURIComponent(size)}`}>View matching tyres →</Link>
      ) : null}
    </div>
  );
}
