import { NextResponse } from "next/server";

const countryCurrency: Record<string, string> = {
  PK:"PKR", US:"USD", CA:"CAD", GB:"GBP", AE:"AED", SA:"SAR", QA:"QAR", KW:"KWD",
  AU:"AUD", NZ:"NZD", SG:"SGD", MY:"MYR", IN:"INR", CN:"CNY", JP:"JPY", KR:"KRW",
  DE:"EUR", FR:"EUR", IT:"EUR", ES:"EUR", NL:"EUR", BE:"EUR", AT:"EUR", PT:"EUR",
  IE:"EUR", CH:"CHF", SE:"SEK", NO:"NOK", DK:"DKK", PL:"PLN", TR:"TRY", ZA:"ZAR",
  BR:"BRL", MX:"MXN", TH:"THB", ID:"IDR"
};

export const runtime = "nodejs";

export async function GET(request: Request) {
  const country = (request.headers.get("x-vercel-ip-country") || request.headers.get("x-country") || "").toUpperCase();
  return NextResponse.json(
    { country, currency: countryCurrency[country] || "USD" },
    { headers: { "Cache-Control": "private, max-age=3600" } }
  );
}
