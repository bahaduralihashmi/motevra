"use server";

import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendOrderConfirmationEmail } from "@/lib/email";

const orderSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  city: z.string().trim().min(2, "Enter your city."),
  streetAddress: z.string().trim().min(5, "Enter your street address."),
  email: z.string().trim().email("Enter a valid email address."),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "EASYPISA", "JAZZCASH"]),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        qty: z.number().int().positive().max(99),
      }),
    )
    .min(1, "Your cart is empty."),
});

const SHIPPING_COST = 1250;

function createOrderNumber() {
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `MOT-${new Date().getFullYear()}-${suffix}`;
}

export type CreateOrderResult =
  | { ok: true; orderNumber: string; total: number }
  | { ok: false; message: string };

export async function createOrder(_state: CreateOrderResult | null, formData: FormData): Promise<CreateOrderResult> {
  const rawItems = formData.get("items");
  let items: unknown;

  try {
    items = JSON.parse(typeof rawItems === "string" ? rawItems : "[]");
  } catch {
    return { ok: false, message: "Your cart could not be read. Please try again." };
  }

  const payload = orderSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    streetAddress: formData.get("streetAddress"),
    email: formData.get("email"),
    paymentMethod: formData.get("paymentMethod"),
    items,
  });

  if (!payload.success) {
    return { ok: false, message: payload.error.issues[0]?.message ?? "Check your order details." };
  }

  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message: "Orders are unavailable until DATABASE_URL is configured. Your cart has not been submitted.",
    };
  }

  const session = await getServerSession(authOptions);
  const productIds = payload.data.items.map((item) => item.id);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    select: { id: true, sku: true, name: true, price: true, salePrice: true, stock: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  if (products.length !== new Set(productIds).size) {
    return { ok: false, message: "One or more products are no longer available." };
  }

  const lineItems = payload.data.items.map((item) => {
    const product = productById.get(item.id);
    if (!product || product.stock < item.qty) {
      return null;
    }

    const unitPrice = Number(product.salePrice ?? product.price);
    return {
      productId: product.id,
      sku: product.sku,
      name: product.name,
      quantity: item.qty,
      unitPrice,
      total: unitPrice * item.qty,
    };
  });

  if (lineItems.some((item) => item === null)) {
    return { ok: false, message: "One or more products do not have enough stock." };
  }

  const validLineItems = lineItems.filter((item): item is NonNullable<typeof item> => item !== null);
  const subtotal = validLineItems.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + SHIPPING_COST;
  const orderNumber = createOrderNumber();

  try {
    await db.$transaction(async (transaction) => {
      for (const item of validLineItems) {
        const updated = await transaction.product.updateMany({
          where: { id: item.productId, status: "ACTIVE", stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count !== 1) {
          throw new Error("Stock changed while placing the order.");
        }
      }

      await transaction.order.create({
        data: {
          orderNumber,
          status: "PROCESSING",
          ...(session?.user?.id ? { user: { connect: { id: session.user.id } } } : {}),
          subtotal: String(subtotal),
          shippingCost: String(SHIPPING_COST),
          tax: "0",
          total: String(total),
          customerEmail: payload.data.email,
          country: "PK",
          items: {
            create: validLineItems.map((item) => ({
              productId: item.productId,
              sku: item.sku,
              name: item.name,
              quantity: item.quantity,
              unitPrice: String(item.unitPrice),
              total: String(item.total),
            })),
          },
          addresses: {
            create: {
              fullName: payload.data.fullName,
              phone: payload.data.phone,
              city: payload.data.city,
              streetAddress: payload.data.streetAddress,
              country: "PK",
            },
          },
          payments: {
            create: {
              method: payload.data.paymentMethod,
              amount: String(total),
              currency: "PKR",
            },
          },
        },
      });
    });

    try {
      await sendOrderConfirmationEmail({
        orderNumber,
        customerEmail: payload.data.email,
        total,
        items: validLineItems,
      });
    } catch (emailError) {
      console.error("Order confirmation email failed", emailError);
    }
  } catch (error) {
    console.error("Order creation failed", error);
    const detail = error instanceof Error ? error.message : "Unknown database error";
    return {
      ok: false,
      message: process.env.NODE_ENV === "development"
        ? `Order could not be saved: ${detail}`
        : "We could not place the order. No payment was taken.",
    };
  }

  return { ok: true, orderNumber, total };
}
