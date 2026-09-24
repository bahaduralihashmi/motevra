"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CurrencyCode = string;

type Currency = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
  decimals: number;
};

export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", decimals: 2 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", decimals: 0 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", decimals: 2 },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", decimals: 2 },
  { code: "QAR", name: "Qatari Riyal", symbol: "﷼", flag: "🇶🇦", decimals: 2 },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", flag: "🇰🇼", decimals: 3 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", decimals: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", flag: "🇳🇿", decimals: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", decimals: 2 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", decimals: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", decimals: 2 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", decimals: 0 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", decimals: 0 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭", decimals: 2 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", decimals: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", decimals: 2 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", decimals: 2 },
  { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", decimals: 2 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", decimals: 2 },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", decimals: 2 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", decimals: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", flag: "🇲🇽", decimals: 2 },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", decimals: 2 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", decimals: 0 },
];

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: Record<string, number>;
  loading: boolean;
  format: (amount: number, from?: string) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function getLocale(currency: string) {
  switch (currency) {
    case "PKR": return "en-PK";
    case "AED": return "en-AE";
    case "SAR": return "en-SA";
    case "QAR": return "en-QA";
    case "KWD": return "en-KW";
    case "GBP": return "en-GB";
    case "EUR": return "en-DE";
    case "CAD": return "en-CA";
    case "AUD": return "en-AU";
    case "INR": return "en-IN";
    default: return "en-US";
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem("motevra_currency");
    if (saved && currencies.some((item) => item.code === saved)) {
      setCurrencyState(saved);
      return;
    }

    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (data?.currency && currencies.some((item) => item.code === data.currency)) {
          setCurrencyState(data.currency);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    window.localStorage.setItem("motevra_currency", currency);
  }, [currency]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.rates && typeof data.rates === "object") {
          setRates(data.rates);
        }
      })
      .catch(() => {
        if (!cancelled) setRates({ USD: 1 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CurrencyContextValue>(() => ({
    currency,
    setCurrency: setCurrencyState,
    rates,
    loading,
    format: (amount, from = "USD") => {
      const sourceRate = rates[from] || 1;
      const targetRate = rates[currency] || 1;
      const converted = amount * (targetRate / sourceRate);
      const config = currencies.find((item) => item.code === currency);
      const decimals = config?.decimals ?? 2;

      return new Intl.NumberFormat(getLocale(currency), {
        style: "currency",
        currency,
        maximumFractionDigits: decimals,
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

export function useSupportedCurrencies() {
  return currencies;
}
