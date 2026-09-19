"use client";

import { useState } from "react";

const fallbackImage = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80";

export function ProductImageFields() {
  const [urls, setUrls] = useState([fallbackImage]);

  function updateUrl(index: number, value: string) {
    setUrls((current) => current.map((url, itemIndex) => itemIndex === index ? value : url));
  }

  function addImage() {
    setUrls((current) => [...current, ""]);
  }

  function removeImage(index: number) {
    setUrls((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">Product images</label>
        <button type="button" onClick={addImage} className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">Add image</button>
      </div>
      <div className="space-y-3">
        {urls.map((url, index) => (
          <div key={index} className="flex gap-3">
            <input name="imageUrls" value={url} onChange={(event) => updateUrl(index, event.target.value)} placeholder="https://..." className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-500" />
            {urls.length > 1 ? <button type="button" onClick={() => removeImage(index)} className="rounded-full border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-600">Remove</button> : null}
          </div>
        ))}
      </div>
      <label className="mt-4 block text-sm font-medium text-slate-700">Upload from your computer
        <input type="file" name="imageFiles" accept="image/png,image/jpeg,image/webp,image/avif" multiple className="mt-2 block w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm" />
      </label>
      <p className="mt-2 text-xs text-slate-500">Uploaded files are stored in the local public/uploads folder. Use durable object storage before deploying.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {urls.filter(Boolean).map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Product preview ${index + 1}`} className="h-28 w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover" />)}
      </div>
    </div>
  );
}
