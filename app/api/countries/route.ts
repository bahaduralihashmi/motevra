import { NextResponse } from "next/server";

const countries = [
  ["PK","Pakistan","PKR"],["US","United States","USD"],["CA","Canada","CAD"],["GB","United Kingdom","GBP"],
  ["AE","United Arab Emirates","AED"],["SA","Saudi Arabia","SAR"],["QA","Qatar","QAR"],["KW","Kuwait","KWD"],
  ["AU","Australia","AUD"],["NZ","New Zealand","NZD"],["SG","Singapore","SGD"],["MY","Malaysia","MYR"],
  ["IN","India","INR"],["CN","China","CNY"],["JP","Japan","JPY"],["KR","South Korea","KRW"],
  ["DE","Germany","EUR"],["FR","France","EUR"],["IT","Italy","EUR"],["ES","Spain","EUR"],
  ["NL","Netherlands","EUR"],["BE","Belgium","EUR"],["AT","Austria","EUR"],["PT","Portugal","EUR"],
  ["IE","Ireland","EUR"],["CH","Switzerland","CHF"],["SE","Sweden","SEK"],["NO","Norway","NOK"],
  ["DK","Denmark","DKK"],["PL","Poland","PLN"],["TR","Türkiye","TRY"],["ZA","South Africa","ZAR"],
  ["BR","Brazil","BRL"],["MX","Mexico","MXN"],["TH","Thailand","THB"],["ID","Indonesia","IDR"]
] as const;

export async function GET() {
  return NextResponse.json(
    { countries: countries.map(([code,name,currencyCode]) => ({code,name,currencyCode})) },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
  );
}
