import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { decryptCredentials } from "@/lib/supplier-credentials";

export const runtime = "nodejs";

type CJResponse = {
  code?: number;
  result?: boolean;
  message?: string;
  data?: {
    orderId?: string;
    orderNumber?: string;
    shipmentOrderId?: string;
    postageAmount?: string | number;
    actualPayment?: string | number;
    orderStatus?: string;
  };
};

async function getCJToken(supplierId: string) {
  const prisma = getPrisma();
  const credential = await prisma.supplierCredential.findFirst({
    where: { supplierId, provider: "CJ_DROPSHIPPING", status: "CONNECTED" },
    select: { encryptedData: true },
  });
  if (!credential) return null;
  try {
    const data = decryptCredentials<{ accessToken?: string }>(credential.encryptedData);
    return data.accessToken || null;
  } catch {
    return null;
  }
}

async function getCJShipping(
  token: string,
  origin: string,
  destination: string,
  products: Array<{ vid: string; quantity: number }>,
) {
  const response = await fetch(
    "https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "CJ-Access-Token": token,
      },
      body: JSON.stringify({
        startCountryCode: origin,
        endCountryCode: destination,
        products,
      }),
      cache: "no-store",
    },
  );
  const json = await response.json().catch(() => null);
  if (!response.ok || json?.code !== 200 || !Array.isArray(json?.data)) {
    throw new Error(json?.message || "CJ freight calculation failed.");
  }

  const options = json.data
    .map((item: any) => ({
      name: String(item.logisticName || ""),
      price: Number(item.logisticPrice ?? item.totalPostageFee ?? 0),
      aging: String(item.logisticAging || ""),
    }))
    .filter((item: { name: string; price: number }) =>
      item.name && Number.isFinite(item.price) && item.price >= 0,
    )
    .sort((a: { price: number }, b: { price: number }) => a.price - b.price);

  if (!options.length) throw new Error("CJ returned no available shipping method.");
  return options[0];
}

export async function POST(req: NextRequest) {
  if (!await getAdminUser()) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const orderId = String(body.orderId || "").trim();
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

    const prisma = getPrisma();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                supplierProducts: {
                  where: {
                    active: true,
                    supplier: { type: "CJ_DROPSHIPPING", status: "ACTIVE" },
                  },
                  include: {
                    supplier: true,
                    variants: true,
                    inventories: {
                      where: { available: { gt: 0 } },
                      include: { warehouse: true },
                    },
                  },
                },
              },
            },
          },
        },
        supplierOrders: { include: { supplier: true } },
      },
    });

    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.paymentStatus !== "PAID") {
      return NextResponse.json(
        { error: "CJ fulfillment is blocked until the MOTEVRA order is marked PAID." },
        { status: 409 },
      );
    }

    const existingCJ = order.supplierOrders.find((item) => item.supplier.type === "CJ_DROPSHIPPING");
    if (existingCJ) {
      return NextResponse.json({
        message: "CJ supplier order already exists.",
        supplierOrderId: existingCJ.id,
        externalOrderId: existingCJ.externalOrderId,
      });
    }

    const cjLines: Array<{
      orderItemId: string;
      supplierProductId: string;
      supplierVariantId: string;
      supplierId: string;
      token: string;
      vid: string;
      quantity: number;
      unitCost: number;
      currency: string;
      origin: string;
      shippingName: string;
      shippingCostUSD: number;
    }> = [];

    for (const item of order.items) {
      const mappings = item.product.supplierProducts;
      if (!mappings.length) continue;
      if (mappings.length > 1) {
        return NextResponse.json(
          { error: "Multiple CJ mappings exist for " + item.product.name + ". Choose one supplier mapping before fulfillment." },
          { status: 409 },
        );
      }

      const mapping = mappings[0];
      const variants = mapping.variants.filter((v) => v.externalVariantId);
      if (variants.length !== 1) {
        return NextResponse.json(
          {
            error:
              "CJ fulfillment needs exactly one mapped CJ variant for " +
              item.product.name +
              ". Variant-aware cart selection is required for multi-variant products.",
          },
          { status: 409 },
        );
      }

      const inventory = mapping.inventories.find((i) => i.warehouse.countryCode);
      if (!inventory?.warehouse.countryCode) {
        return NextResponse.json(
          { error: "No CJ warehouse origin is available for " + item.product.name + "." },
          { status: 409 },
        );
      }

      const token = await getCJToken(mapping.supplierId);
      if (!token) {
        return NextResponse.json({ error: "CJ is not connected." }, { status: 409 });
      }

      const shipping = await getCJShipping(
        token,
        inventory.warehouse.countryCode.toUpperCase(),
        order.shippingCountry.toUpperCase(),
        [{ vid: variants[0].externalVariantId!, quantity: item.quantity }],
      );

      cjLines.push({
        orderItemId: item.id,
        supplierProductId: mapping.id,
        supplierVariantId: variants[0].id,
        supplierId: mapping.supplierId,
        token,
        vid: variants[0].externalVariantId!,
        quantity: item.quantity,
        unitCost: Number(variants[0].supplierCost),
        currency: variants[0].supplierCurrency,
        origin: inventory.warehouse.countryCode.toUpperCase(),
        shippingName: shipping.name,
        shippingCostUSD: shipping.price,
      });
    }

    if (!cjLines.length) {
      return NextResponse.json({ message: "This order contains no CJ products." });
    }

    const bySupplier = new Map<string, typeof cjLines>();
    for (const line of cjLines) {
      const list = bySupplier.get(line.supplierId) || [];
      list.push(line);
      bySupplier.set(line.supplierId, list);
    }

    const createdOrders = [];
    for (const [supplierId, lines] of bySupplier) {
      const token = lines[0].token;
      const origin = lines[0].origin;
      const logisticName = lines[0].shippingName;
      const response = await fetch(
        "https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV3",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "CJ-Access-Token": token,
          },
          body: JSON.stringify({
            orderNumber: order.number + "-" + supplierId.slice(-6),
            shippingZip: order.shippingPostalCode || "",
            shippingCountryCode: order.shippingCountry,
            shippingCountry: order.shippingCountry,
            shippingProvince: order.shippingRegion || "",
            shippingCity: order.shippingCity,
            shippingPhone: order.shippingPhone,
            shippingCustomerName: order.shippingName,
            shippingAddress: order.shippingLine1,
            shippingAddress2: order.shippingLine2 || "",
            email: order.guestEmail || "",
            remark: "MOTEVRA order " + order.number,
            logisticName,
            fromCountryCode: origin,
            platform: "Api",
            shopLogisticsType: 2,
            orderFlow: 1,
            payType: 3,
            products: lines.map((line) => ({
              vid: line.vid,
              quantity: line.quantity,
              storeLineItemId: line.orderItemId,
            })),
          }),
          cache: "no-store",
        },
      );

      const json = (await response.json().catch(() => null)) as CJResponse | null;
      if (!response.ok || json?.code !== 200 || !json?.data?.orderId) {
        return NextResponse.json(
          {
            error: json?.message || "CJ order creation failed.",
            supplierId,
            cjResponse: json,
          },
          { status: 502 },
        );
      }

      const data = json.data;
      const supplierOrder = await prisma.$transaction(async (tx) => {
        const created = await tx.supplierOrder.create({
          data: {
            orderId: order.id,
            supplierId,
            externalOrderId: data.orderId,
            status: data.orderStatus || "CREATED",
            currency: "USD",
            supplierTotal: Number(data.actualPayment ?? 0),
            shippingCost: Number(data.postageAmount ?? 0),
            items: {
              create: lines.map((line) => ({
                orderItemId: line.orderItemId,
                quantity: line.quantity,
                unitCost: line.unitCost,
              })),
            },
          },
        });

        await tx.commissionLedger.create({
          data: {
            orderId: order.id,
            type: "SUPPLIER_COST",
            amount: Number(data.actualPayment ?? 0),
            currency: "USD",
            description: "CJ supplier order " + data.orderId,
            referenceId: created.id,
          },
        });

        return created;
      });

      createdOrders.push({
        supplierOrderId: supplierOrder.id,
        externalOrderId: data.orderId,
        shipmentOrderId: data.shipmentOrderId || null,
        shippingMethod: logisticName,
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PROCESSING" },
    });

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.number,
      supplierOrders: createdOrders,
      note: "CJ orders were created with payType=3. They are not paid or confirmed automatically.",
    });
  } catch (error) {
    console.error("CJ fulfillment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create CJ supplier order." },
      { status: 500 },
    );
  }
}
