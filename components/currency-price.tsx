"use client";

import { useCurrency } from "@/components/currency-provider";

export function CurrencyPrice({ amount, from = "USD", prefix = "" }: { amount: number; from?: string; prefix?: string }) {
  const { format, loading } = useCurrency();
  return <span>{prefix}{loading ? "…" : format(amount, from)}</span>;
}
