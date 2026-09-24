"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CurrencyCode = string;
type Currency = { code: CurrencyCode; name: string; symbol: string; flag: string };

const flags: Record<string,string> = {
  USD:"🇺🇸", PKR:"🇵🇰", EUR:"🇪🇺", GBP:"🇬🇧", AED:"🇦🇪", SAR:"🇸🇦", CAD:"🇨🇦",
  AUD:"🇦🇺", NZD:"🇳🇿", SGD:"🇸🇬", INR:"🇮🇳", CNY:"🇨🇳", JPY:"🇯🇵", KRW:"🇰🇷",
  CHF:"🇨🇭", SEK:"🇸🇪", NOK:"🇳🇴", DKK:"🇩🇰", PLN:"🇵🇱", TRY:"🇹🇷", ZAR:"🇿🇦",
  BRL:"🇧🇷", MXN:"🇲🇽", THB:"🇹🇭", MYR:"🇲🇾", IDR:"🇮🇩", QAR:"🇶🇦", KWD:"🇰🇼"
};

const fallbackCurrencies: Currency[] = [
  ["USD","US Dollar","$"],["PKR","Pakistani Rupee","₨"],["EUR","Euro","€"],["GBP","British Pound","£"],
  ["AED","UAE Dirham","د.إ"],["SAR","Saudi Riyal","﷼"],["CAD","Canadian Dollar","CA$"],
  ["AUD","Australian Dollar","A$"],["INR","Indian Rupee","₹"],["CNY","Chinese Yuan","¥"],
  ["JPY","Japanese Yen","¥"],["CHF","Swiss Franc","CHF"]
].map(([code,name,symbol]) => ({code,name,symbol,flag:flags[code]||"🌐"}));

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: Record<string, number>;
  loading: boolean;
  format: (amount: number, from?: string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [currencies, setCurrencies] = useState<Currency[]>(fallbackCurrencies);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("motevra_currency");
    if (saved) {
      setCurrencyState(saved);
      setLoading(false);
      return;
    }
    fetch("/api/geo").then(r=>r.json()).then(data=>{
      if (data.currency) setCurrencyState(data.currency);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/currencies").then(r=>r.json()).then(data=>{
      if (Array.isArray(data.currencies)) {
        setCurrencies(data.currencies.map((c: {code:string;name:string;symbol:string})=>({...c,flag:flags[c.code]||"🌐"})));
      }
    }).catch(()=>{});
  }, []);

  useEffect(() => {
    window.localStorage.setItem("motevra_currency", currency);
  }, [currency]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange-rates")
      .then(r => r.json())
      .then(data => { if (!cancelled && data.rates) setRates(data.rates); })
      .catch(() => { if (!cancelled) setRates({USD:1}); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency: (next) => setCurrencyState(next),
    rates,
    loading,
    format: (amount, from = "USD") => {
      const sourceRate = rates[from] || 1;
      const targetRate = rates[currency] || 1;
      const converted = amount * (targetRate / sourceRate);
      const decimals = currencies.find(c=>c.code===currency)?.code === "PKR" ? 0 : 2;
      const locale = currency === "PKR" ? "en-PK" : currency === "AED" ? "en-AE" : currency === "SAR" ? "en-SA" : currency === "GBP" ? "en-GB" : currency === "EUR" ? "en-DE" : "en-US";
      return new Intl.NumberFormat(locale, {style:"currency",currency,maximumFractionDigits:decimals}).format(converted);
    }
  }), [currency,rates,loading,currencies]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("useCurrency must be used inside CurrencyProvider");
  return value;
}

export function useSupportedCurrencies() {
  return fallbackCurrencies;
}
