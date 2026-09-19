import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const prisma = getPrisma();
  const make = request.nextUrl.searchParams.get("make");
  const model = request.nextUrl.searchParams.get("model");
  const year = Number(request.nextUrl.searchParams.get("year"));
  if (make) {
    const record = await prisma.vehicleMake.findUnique({
      where: { slug: make },
      include: { models: { orderBy: { name: "asc" }, include: { variants: { orderBy: { yearFrom: "desc" } } } } },
    });
    return NextResponse.json({ vehicle: record });
  }
  if (model) {
    const record = await prisma.vehicleModel.findUnique({
      where: { id: model },
      include: { make: true, variants: { orderBy: { yearFrom: "desc" } } },
    });
    return NextResponse.json({ vehicle: record });
  }
  const makes = await prisma.vehicleMake.findMany({ orderBy: { name: "asc" }, include: { models: { orderBy: { name: "asc" } } } });
  return NextResponse.json({ makes });
}
