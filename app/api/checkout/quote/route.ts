import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { buildCheckoutQuote } from "@/lib/checkout/quote";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const country = String(body.country || "PK").trim().toUpperCase();
    const session = await auth().catch(() => null);
    const prisma = getPrisma();

    let userId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id || null;
    }

    const cookieStore = await cookies();
    const cartId = cookieStore.get("motevra_cart")?.value;
    const cart = userId
      ? await prisma.cart.findFirst({
          where: { userId, status: "ACTIVE" },
          include: { items: { include: { product: { include: { supplierProducts: { where: { active: true }, select: { supplierId: true, active: true, supplier: { select: { type: true } }, variants: { select: { externalVariantId: true, productVariantId: true } }, inventories: { where: { available: { gt: 0 } }, select: { available: true, quantity: true, warehouse: { select: { countryCode: true } } } } } } } } } } },
        })
      : cartId
        ? await prisma.cart.findFirst({
            where: { id: cartId, userId: null, status: "ACTIVE" },
            include: { items: { include: { product: { include: { supplierProducts: { where: { active: true }, select: { supplierId: true, active: true } } } } } } },
          })
        : null;

    if (!cart?.items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const quote = await buildCheckoutQuote(
      cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        product: {
          shippingClass: item.product.shippingClass,
          weight: item.product.weight,
          supplierProducts: item.product.supplierProducts,
        },
      })),
      country,
      cart.currency || "USD",
    );

    return NextResponse.json(quote, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch (error) {
    console.error("Checkout quote error:", error);
    return NextResponse.json({ error: "Unable to calculate checkout quote." }, { status: 500 });
  }
}
