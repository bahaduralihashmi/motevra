"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendOrderStatusEmail } from "@/lib/email";

const statusSchema = z.enum(["PENDING", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"]);

export async function updateOrderStatus(formData: FormData) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const orderId = formData.get("orderId");
  const status = statusSchema.safeParse(formData.get("status"));
  if (typeof orderId !== "string" || !status.success) throw new Error("Invalid order status update.");

  const order = await db.order.update({ where: { id: orderId }, data: { status: status.data }, include: { items: true } });
  if (order.customerEmail) {
    try {
      await sendOrderStatusEmail({ orderNumber: order.orderNumber, customerEmail: order.customerEmail, status: order.status });
    } catch (emailError) {
      console.error("Order status email failed", emailError);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/account/orders");
}
