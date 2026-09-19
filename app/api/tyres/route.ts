import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const width = Number(p.get("width"));
  const aspectRatio = Number(p.get("aspectRatio"));
  const rimSize = Number(p.get("rimSize"));
  const products = await getPrisma().product.findMany({
    where: {
      status: "ACTIVE",
      productType: "TYRE",
      ...(width && aspectRatio && rimSize ? { tyre: { size: { width, aspectRatio, rimSize } } } : {}),
    },
    include: { brand: true, images: { orderBy: { position: "asc" }, take: 1 }, tyre: { include: { size: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}
