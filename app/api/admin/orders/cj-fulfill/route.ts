import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin";
import { decryptCredentials } from "@/lib/supplier-credentials";

export const runtime = "nodejs";

const prisma = getPrisma();

function isCronRequest(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

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

export async function GET(req: NextRequest) {
  if (!isCronRequest(req)) {
    return NextResponse.json({ error: "Cron authentication required." }, { status: 401 });
  }

  return POST(new NextRequest(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({ mode: "sync" }),
  }));
}

export async function POST(req: NextRequest) {
  if (!isCronRequest(req) && !await getAdminUser()) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const orderId = String(body.orderId || "").trim();
    const mode = String(body.mode || "").trim().toLowerCase();

    if (mode === "sync") {
      const syncOrders = await prisma.supplierOrder.findMany({
        where: orderId ? { orderId } : {},
        include: { supplier: true, shipments: true },
        orderBy: { createdAt: "desc" },
      });
      const results = [];
      for (const so of syncOrders) {
        if (so.supplier.type !== "CJ_DROPSHIPPING" || !so.externalOrderId) continue;
        const token = await getCJToken(so.supplierId);
        if (!token) { results.push({ supplierOrderId: so.id, error: "CJ is not connected." }); continue; }

        const response = await fetch(
          "https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=" +
            encodeURIComponent(so.externalOrderId),
          { headers: { "CJ-Access-Token": token }, cache: "no-store" },
        );
        const json = await response.json().catch(() => null);
        if (!response.ok || json?.code !== 200 || !json?.data) {
          results.push({ supplierOrderId: so.id, error: json?.message || "CJ order detail failed." });
          continue;
        }

        const d = json.data;
        const trackingNumber = String(d.trackNumber || d.trackingNumber || d.cjTrackingNumber || "").trim() || null;
        const carrier = String(d.trackingProvider || d.logisticName || "").trim() || null;
        const trackingUrl = String(d.trackingUrl || "").trim() ||
          (trackingNumber ? "https://www.17track.net/en?nums=" + encodeURIComponent(trackingNumber) : null);
        const cjStatus = String(d.orderStatus || so.status || "").toUpperCase();

        let shipmentStatus: "PENDING"|"LABEL_CREATED"|"SHIPPED"|"IN_TRANSIT"|"OUT_FOR_DELIVERY"|"DELIVERED"|"EXCEPTION"|"RETURNED"|"CANCELLED" = "PENDING";
        if (cjStatus === "DELIVERED") shipmentStatus = "DELIVERED";
        else if (cjStatus === "SHIPPED") shipmentStatus = "SHIPPED";
        else if (cjStatus === "OUT_FOR_DELIVERY") shipmentStatus = "OUT_FOR_DELIVERY";
        else if (cjStatus === "CANCELLED") shipmentStatus = "CANCELLED";
        else if (trackingNumber) shipmentStatus = "IN_TRANSIT";
        else if (cjStatus === "PROCESSING" || cjStatus === "UNSHIPPED" || cjStatus === "PAID") shipmentStatus = "LABEL_CREATED";

        const shipment = await prisma.$transaction(async (tx) => {
          await tx.supplierOrder.update({
            where: { id: so.id },
            data: { status: cjStatus || so.status, trackingNumber, trackingUrl },
          });

          let current = so.shipments[0];
          if (!current) {
            current = await tx.shipment.create({
              data: {
                orderId: so.orderId,
                supplierOrderId: so.id,
                status: shipmentStatus,
                carrier,
                serviceName: d.logisticName || null,
                trackingNumber,
                trackingUrl,
                currency: "USD",
              },
            });
          } else {
            current = await tx.shipment.update({
              where: { id: current.id },
              data: {
                status: shipmentStatus,
                carrier,
                serviceName: d.logisticName || current.serviceName,
                trackingNumber,
                trackingUrl,
                shippedAt: (shipmentStatus === "SHIPPED" || shipmentStatus === "IN_TRANSIT") ? (current.shippedAt || new Date()) : current.shippedAt,
                deliveredAt: shipmentStatus === "DELIVERED" ? (current.deliveredAt || new Date()) : current.deliveredAt,
              },
            });
          }

          if (trackingNumber) {
            const tr = await fetch(
              "https://developers.cjdropshipping.com/api2.0/v1/logistic/trackInfo?trackNumber=" +
                encodeURIComponent(trackingNumber),
              { headers: { "CJ-Access-Token": token }, cache: "no-store" },
            );
            const tj = await tr.json().catch(() => null);
            if (tr.ok && tj?.code === 200 && Array.isArray(tj.data)) {
              for (const ev of tj.data) {
                const occurredAt = ev.deliveryTime ? new Date(ev.deliveryTime) : new Date();
                if (Number.isNaN(occurredAt.getTime())) continue;
                const status = String(ev.trackingStatus || shipmentStatus);
                const exists = await tx.trackingEvent.findFirst({
                  where: { shipmentId: current.id, occurredAt, status },
                  select: { id: true },
                });
                if (!exists) {
                  await tx.trackingEvent.create({
                    data: {
                      shipmentId: current.id,
                      status,
                      description: String(ev.lastMileCarrier || ev.trackingStatus || "CJ tracking update"),
                      location: String(ev.trackingFrom && ev.trackingTo ? ev.trackingFrom + " → " + ev.trackingTo : ""),
                      occurredAt,
                    },
                  });
                }
              }
            }
          }
          return current;
        });

        results.push({
          supplierOrderId: so.id,
          externalOrderId: so.externalOrderId,
          status: cjStatus || so.status,
          trackingNumber: shipment.trackingNumber,
          trackingUrl: shipment.trackingUrl,
        });
      }
      return NextResponse.json({ ok: true, mode: "sync", orderId: orderId || null, results });
    }

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

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
      const variants = mapping.variants.filter(
        (v) => v.externalVariantId && (!item.variantId || v.productVariantId === item.variantId),
      );
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

      // CJ recommends creating with payType=3 and then completing balance payment.
      // Confirm first, then pay the shipment order from the connected CJ balance.
      const confirmResponse = await fetch(
        "https://developers.cjdropshipping.com/api2.0/v1/shopping/order/confirmOrder",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
          body: JSON.stringify({ orderId: data.orderId }),
          cache: "no-store",
        },
      );
      const confirmJson = await confirmResponse.json().catch(() => null);
      if (!confirmResponse.ok || confirmJson?.code !== 200 || confirmJson?.result === false) {
        return NextResponse.json(
          { error: confirmJson?.message || "CJ order confirmation failed.", supplierId, externalOrderId: data.orderId },
          { status: 502 },
        );
      }

      const shipmentOrderId = data.shipmentOrderId || data.orderId;
      const paymentResponse = await fetch(
        "https://developers.cjdropshipping.com/api2.0/v1/shopping/pay/payBalanceV2",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
          body: JSON.stringify({ shipmentOrderId }),
          cache: "no-store",
        },
      );
      const paymentJson = await paymentResponse.json().catch(() => null);
      if (!paymentResponse.ok || paymentJson?.code !== 200 || paymentJson?.result === false) {
        return NextResponse.json(
          {
            error: paymentJson?.message || "CJ balance payment failed.",
            supplierId,
            externalOrderId: data.orderId,
            shipmentOrderId,
            cjResponse: paymentJson,
          },
          { status: 502 },
        );
      }

      const supplierOrder = await prisma.$transaction(async (tx) => {
        const created = await tx.supplierOrder.create({
          data: {
            orderId: order.id,
            supplierId,
            externalOrderId: data.orderId,
            status: "PAID",
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
        shipmentOrderId,
        shippingMethod: logisticName,
        paid: true,
      });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PROCESSING" },
    });

    // Create a shipment record immediately. Tracking is populated by the CJ sync job
    // once CJ assigns the carrier/tracking number.
    for (const created of createdOrders) {
      const supplierOrder = await prisma.supplierOrder.findUnique({
        where: { id: created.supplierOrderId },
        include: { supplier: true },
      });
      if (!supplierOrder) continue;
      await prisma.shipment.create({
        data: {
          orderId: order.id,
          supplierOrderId: supplierOrder.id,
          status: "PENDING",
          carrier: created.shippingMethod,
          serviceName: created.shippingMethod,
          shippingCost: supplierOrder.shippingCost,
          currency: supplierOrder.currency,
          items: {
            create: order.items
              .filter((item) => item.product.supplierProducts.some((sp) => sp.supplierId === supplierOrder.supplierId))
              .map((item) => ({ orderItemId: item.id, quantity: item.quantity })),
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNumber: order.number,
      supplierOrders: createdOrders,
      note: "CJ orders were created, confirmed, and paid from the connected CJ balance after MOTEVRA payment verification.",
    });
  } catch (error) {
    console.error("CJ fulfillment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create CJ supplier order." },
      { status: 500 },
    );
  }
}
