export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">Admin</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          ["Revenue", "PKR 8.7M"],
          ["Conversion", "4.8%"],
          ["Avg order", "PKR 24,300"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</div>
            <div className="mt-4 text-3xl font-black tracking-[-0.06em] text-slate-900">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
