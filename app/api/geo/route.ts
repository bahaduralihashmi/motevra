import { NextResponse } from "next/server";

export const runtime = "edge";

const countryCurrency: Record<string, string> = {
  PK: "PKR",
  AE: "AED",
  SA: "SAR",
  GB: "GBP",
  US: "USD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  IE: "EUR",
};

export async function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country") || request.headers.get("x-country") || "";
  return NextResponse.json({ country, currency: countryCurrency[country] || "USD" }, {
    headers: { "Cache-Control": "private, max-age=3600" },
  });
}
