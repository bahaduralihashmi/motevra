import { NextResponse } from "next/server";

const currencies = [
  ["USD","US Dollar","$",2],["PKR","Pakistani Rupee","₨",0],["EUR","Euro","€",2],["GBP","British Pound","£",2],
  ["AED","UAE Dirham","د.إ",2],["SAR","Saudi Riyal","﷼",2],["CAD","Canadian Dollar","CA$",2],
  ["AUD","Australian Dollar","A$",2],["NZD","New Zealand Dollar","NZ$",2],["SGD","Singapore Dollar","S$",2],
  ["INR","Indian Rupee","₹",2],["CNY","Chinese Yuan","¥",2],["JPY","Japanese Yen","¥",0],
  ["KRW","South Korean Won","₩",0],["CHF","Swiss Franc","CHF",2],["SEK","Swedish Krona","kr",2],
  ["NOK","Norwegian Krone","kr",2],["DKK","Danish Krone","kr",2],["PLN","Polish Zloty","zł",2],
  ["TRY","Turkish Lira","₺",2],["ZAR","South African Rand","R",2],["BRL","Brazilian Real","R$",2],
  ["MXN","Mexican Peso","MX$",2],["THB","Thai Baht","฿",2],["MYR","Malaysian Ringgit","RM",2],
  ["IDR","Indonesian Rupiah","Rp",0],["QAR","Qatari Riyal","﷼",2],["KWD","Kuwaiti Dinar","د.ك",3]
] as const;

export async function GET() {
  return NextResponse.json(
    { currencies: currencies.map(([code,name,symbol,decimals]) => ({code,name,symbol,decimals})) },
    { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } }
  );
}
