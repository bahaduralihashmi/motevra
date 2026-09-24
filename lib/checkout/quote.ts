import { getPrisma } from "@/lib/prisma";

type QuoteItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    shippingClass: string;
    weight: number | null;
    supplierProducts?: Array<{ supplierId: string; active: boolean }>;
  };
};

type QuoteResult = {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  sourceCurrency: string;
  displayCurrency: string;
  exchangeRate: number;
  shippingConfigured: boolean;
  taxConfigured: boolean;
  shippingMethod: string;
};

const COUNTRY_CURRENCIES: Record<string, string> = {
  PK: "PKR", US: "USD", CA: "CAD", GB: "GBP", AE: "AED", SA: "SAR",
  QA: "QAR", KW: "KWD", AU: "AUD", NZ: "NZD", SG: "SGD", MY: "MYR",
  IN: "INR", CN: "CNY", JP: "JPY", KR: "KRW", DE: "EUR", FR: "EUR",
  IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", AT: "EUR", PT: "EUR",
  IE: "EUR", CH: "CHF", SE: "SEK", NO: "NOK", DK: "DKK", PL: "PLN",
  TR: "TRY", ZA: "ZAR", BR: "BRL", MX: "MXN", TH: "THB", ID: "IDR",
};

async function getRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 1800 },
    });
    const data = await response.json();
    if (data?.rates && typeof data.rates === "object") {
      return { USD: 1, ...data.rates } as Record<string, number>;
    }
  } catch {}
  return { USD: 1 } as Record<string, number>;
}

function convert(amount: number, from: string, to: string, rates: Record<string, number>) {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) return amount;
  return amount * (toRate / fromRate);
}

export async function buildCheckoutQuote(
  items: QuoteItem[],
  countryCode: string,
  sourceCurrency: string,
): Promise<QuoteResult> {
  const p = getPrisma();
  const country = countryCode.toUpperCase();
  const dbCountry = await p.country.findUnique({
    where: { code: country },
    select: { id: true, currencyCode: true },
  });

  const displayCurrency = dbCountry?.currencyCode || COUNTRY_CURRENCIES[country] || sourceCurrency || "USD";
  const rates = await getRates();
  const exchangeRate = convert(1, sourceCurrency, displayCurrency, rates);

  const subtotalSource = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  let shippingSource = 0;
  let shippingConfigured = true;
  const zoneCountryIds = dbCountry ? [dbCountry.id] : [];

  if (zoneCountryIds.length) {
    const memberships = await p.shippingZoneCountry.findMany({
      where: { countryId: { in: zoneCountryIds }, zone: { active: true } },
      select: { zoneId: true },
    });
    const zoneIds = memberships.map((m) => m.zoneId);

    if (zoneIds.length) {
      const rules = await p.shippingRule.findMany({
        where: { zoneId: { in: zoneIds }, active: true },
        orderBy: { price: "asc" },
      });

      const groups = new Map<string, { weight: number; value: number; shippingClass: string; supplierId?: string }>();
      for (const item of items) {
        const supplierId = item.product.supplierProducts?.find((s) => s.active)?.supplierId;
        const key = [item.product.shippingClass, supplierId || "MOTEVRA"].join(":");
        const group = groups.get(key) || {
          weight: 0,
          value: 0,
          shippingClass: item.product.shippingClass,
          supplierId,
        };
        group.weight += (item.product.weight || 0) * item.quantity;
        group.value += Number(item.unitPrice) * item.quantity;
        groups.set(key, group);
      }

      for (const group of groups.values()) {
        const candidates = rules.filter((rule) => {
          if (rule.shippingClass && rule.shippingClass !== group.shippingClass) return false;
          if (rule.supplierId && rule.supplierId !== group.supplierId) return false;
          if (rule.minWeight != null && group.weight < rule.minWeight) return false;
          if (rule.maxWeight != null && group.weight > rule.maxWeight) return false;
          if (rule.minOrderValue != null && group.value < Number(rule.minOrderValue)) return false;
          if (rule.maxOrderValue != null && group.value > Number(rule.maxOrderValue)) return false;
          return true;
        });

        const rule = candidates.sort((a, b) => {
          const specificityA = Number(Boolean(a.shippingClass)) + Number(Boolean(a.supplierId)) + Number(a.minWeight != null) + Number(a.maxWeight != null);
          const specificityB = Number(Boolean(b.shippingClass)) + Number(Boolean(b.supplierId)) + Number(b.minWeight != null) + Number(b.maxWeight != null);
          return specificityB - specificityA || Number(a.price) - Number(b.price);
        })[0];

        if (rule) {
          shippingSource += convert(Number(rule.price), rule.currency, sourceCurrency, rates);
        } else {
          shippingConfigured = false;
        }
      }
    } else {
      shippingConfigured = false;
    }
  } else {
    shippingConfigured = false;
  }

  let taxRate = 0;
  let taxConfigured = false;
  if (dbCountry) {
    const taxRules = await p.taxRule.findMany({
      where: { countryId: dbCountry.id, active: true },
      orderBy: { rate: "asc" },
    });
    const genericRule = taxRules.find((rule) => !rule.taxClass);
    if (genericRule) {
      taxRate = Number(genericRule.rate) / 100;
      taxConfigured = true;
    }
  }

  const taxSource = (subtotalSource + shippingSource) * taxRate;
  const totalSource = subtotalSource + shippingSource + taxSource;

  return {
    subtotal: subtotalSource * exchangeRate,
    shipping: shippingSource * exchangeRate,
    tax: taxSource * exchangeRate,
    total: totalSource * exchangeRate,
    sourceCurrency,
    displayCurrency,
    exchangeRate,
    shippingConfigured,
    taxConfigured,
    shippingMethod: shippingConfigured ? "Standard shipping" : "Shipping rule not configured",
  };
}
