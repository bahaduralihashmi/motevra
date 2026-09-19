"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const payoutSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("BANK_ACCOUNT"), accountName: z.string().trim().min(2), iban: z.string().trim().min(15).max(34), jazzCashPhone: z.literal("").optional() }),
  z.object({ method: z.literal("JAZZCASH"), accountName: z.string().trim().min(2), iban: z.literal("").optional(), jazzCashPhone: z.string().trim().regex(/^03\d{9}$/, "Enter an 11-digit JazzCash number.") }),
]);

export async function savePayoutAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to save payout details.");

  const payload = payoutSchema.safeParse({
    method: formData.get("method"),
    accountName: formData.get("accountName"),
    iban: formData.get("iban") ?? "",
    jazzCashPhone: formData.get("jazzCashPhone") ?? "",
  });
  if (!payload.success) throw new Error(payload.error.issues[0]?.message ?? "Invalid payout details.");

  await db.sellerPayoutAccount.create({ data: { userId: session.user.id, ...payload.data, isDefault: true } });
  redirect("/account/payouts");
}

export async function deletePayoutAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  const id = formData.get("id");
  if (!session?.user?.id) redirect("/login");
  if (!process.env.DATABASE_URL || typeof id !== "string") return;
  await db.sellerPayoutAccount.deleteMany({ where: { id, userId: session.user.id } });
  redirect("/account/payouts");
}
