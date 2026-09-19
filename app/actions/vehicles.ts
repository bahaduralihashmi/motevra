"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const vehicleSchema = z.object({
  manufacturer: z.string().trim().min(2),
  model: z.string().trim().min(1),
  yearFrom: z.coerce.number().int().min(1950).max(2100),
  engine: z.string().trim().optional(),
});

export async function saveVehicle(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  if (!process.env.DATABASE_URL) {
    throw new Error("Saved vehicles require DATABASE_URL to be configured.");
  }

  const payload = vehicleSchema.safeParse({
    manufacturer: formData.get("manufacturer"),
    model: formData.get("model"),
    yearFrom: formData.get("yearFrom"),
    engine: formData.get("engine") || undefined,
  });

  if (!payload.success) {
    throw new Error("Enter a valid vehicle profile.");
  }

  await db.vehicle.create({ data: { userId: session.user.id, ...payload.data } });
  redirect("/account/vehicles");
}

export async function deleteVehicle(formData: FormData) {
  const session = await getServerSession(authOptions);
  const id = formData.get("id");

  if (!session?.user?.id) redirect("/login");
  if (!process.env.DATABASE_URL || typeof id !== "string") return;

  await db.vehicle.deleteMany({ where: { id, userId: session.user.id } });
  redirect("/account/vehicles");
}
