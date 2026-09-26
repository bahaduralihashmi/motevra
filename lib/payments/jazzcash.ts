import { createHash, timingSafeEqual } from "node:crypto";

export type JazzCashFields = Record<string, string>;

export function createJazzCashSecureHash(fields: JazzCashFields, integritySalt: string) {
  const values = Object.entries(fields)
    .filter(([key, value]) => key !== "pp_SecureHash" && value !== "" && value != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, value]) => value);

  const message = integritySalt + values.join("");
  return createHash("sha256").update(message, "utf8").digest("hex").toUpperCase();
}

export function verifyJazzCashSecureHash(
  fields: JazzCashFields,
  integritySalt: string,
  receivedHash: string,
) {
  const expected = createJazzCashSecureHash(fields, integritySalt);
  const a = Buffer.from(expected.toUpperCase());
  const b = Buffer.from(String(receivedHash || "").toUpperCase());
  return a.length === b.length && timingSafeEqual(a, b);
}

export function jazzCashTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
  return get("year") + get("month") + get("day") + get("hour") + get("minute") + get("second");
}
