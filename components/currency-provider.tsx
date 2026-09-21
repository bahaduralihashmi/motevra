"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CurrencyCode = "USD" | "PKR" | "AED" | "SAR" | "GBP" | "EUR";

type Currency = { code: CurrencyCode; name: string; symbol: string; flag: string };
export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
];

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
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("motevra_currency") as CurrencyCode | null;
    if (saved && currencies.some((item) => item.code === saved)) {
      setCurrencyState(saved);
      return;
    }

    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => setCurrencyState(data.currency === "PKR" ? "PKR" : "USD"))
      .catch(() => setCurrencyState("USD"));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("motevra_currency", currency);
  }, [currency]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.rates) setRates(data.rates);
      })
      .catch(() => {
        if (!cancelled) setRates({ USD: 1 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
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
      return new Intl.NumberFormat(currency === "PKR" ? "en-PK" : currency === "AED" ? "en-AE" : currency === "SAR" ? "en-SA" : currency === "GBP" ? "en-GB" : currency === "EUR" ? "en-DE" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "PKR" ? 0 : 2,
      }).format(converted);
    },
  }), [currency, rates, loading]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const value = useContext(CurrencyContext);
  if (!value) throw new Error("useCurrency must be used inside CurrencyProvider");
  return value;
}
