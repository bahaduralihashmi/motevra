import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f97316]">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">This route is not available yet in the current MOTEVRA build.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#f97316] px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white">
          Return home
        </Link>
      </div>
    </div>
  );
}
