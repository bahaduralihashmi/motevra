import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 1800;

export async function GET() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 1800 },
      headers: { "User-Agent": "MOTEVRA/1.0" },
    });
    if (!response.ok) throw new Error("Exchange-rate provider failed");
    const data = await response.json();
    if (!data.rates?.PKR) throw new Error("PKR rate unavailable");

    return NextResponse.json({
      base: "USD",
      rates: data.rates,
      fetchedAt: data.time_last_update_utc ?? new Date().toISOString(),
    }, { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } });
  } catch {
    return NextResponse.json({ base: "USD", rates: { USD: 1 }, error: "Exchange rates temporarily unavailable" }, { status: 503 });
  }
}
