import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ makes: [], error: "Database not configured" }, { status: 503 });
    const prisma = getPrisma();
    const make = request.nextUrl.searchParams.get("make");
    const model = request.nextUrl.searchParams.get("model");
    const year = Number(request.nextUrl.searchParams.get("year"));
    if (make) return NextResponse.json({ vehicle: await prisma.vehicleMake.findUnique({ where: { slug: make }, include: { models: { orderBy: { name: "asc" }, include: { variants: { orderBy: { yearFrom: "desc" } } } } } }) });
    if (model) return NextResponse.json({ vehicle: await prisma.vehicleModel.findUnique({ where: { id: model }, include: { make: true, variants: { orderBy: { yearFrom: "desc" } } } }) });
    return NextResponse.json({ makes: await prisma.vehicleMake.findMany({ orderBy: { name: "asc" }, include: { models: { orderBy: { name: "asc" } } } }) });
  } catch { return NextResponse.json({ makes: [], error: "Vehicle catalogue unavailable" }, { status: 503 }); }
}