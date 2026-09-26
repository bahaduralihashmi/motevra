export const PAYMENT_METHODS = {
  COD: "COD",
  BANK_TRANSFER: "BANK_TRANSFER",
  JAZZCASH: "JAZZCASH",
  EASYPAISA: "EASYPAISA",
  MCB_EGATE: "MCB_EGATE",
  STRIPE: "STRIPE",
  PAYPAL: "PAYPAL",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export function normalizePaymentMethod(value: unknown): PaymentMethod | null {
  const method = String(value || "").trim().toUpperCase();
  return Object.values(PAYMENT_METHODS).includes(method as PaymentMethod)
    ? (method as PaymentMethod)
    : null;
}

export function isPaymentMethodAllowed(method: PaymentMethod, country: string) {
  const destination = country.trim().toUpperCase();

  if (method === PAYMENT_METHODS.COD) return destination === "PK";

  // Pakistan-local gateways are intentionally restricted to Pakistan.
  if (
    method === PAYMENT_METHODS.JAZZCASH ||
    method === PAYMENT_METHODS.EASYPAISA ||
    method === PAYMENT_METHODS.MCB_EGATE
  ) {
    return destination === "PK";
  }

  return true;
}

export function getAvailablePaymentMethods(country: string): PaymentMethod[] {
  const destination = country.trim().toUpperCase();

  if (destination === "PK") {
    return [
      PAYMENT_METHODS.COD,
      PAYMENT_METHODS.BANK_TRANSFER,
      PAYMENT_METHODS.JAZZCASH,
      PAYMENT_METHODS.EASYPAISA,
      PAYMENT_METHODS.MCB_EGATE,
    ];
  }

  // International checkout never exposes COD.
  return [
    PAYMENT_METHODS.BANK_TRANSFER,
    PAYMENT_METHODS.STRIPE,
    PAYMENT_METHODS.PAYPAL,
  ];
}
