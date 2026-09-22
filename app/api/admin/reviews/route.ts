import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const prisma = getPrisma();
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      product: {
        select: {
          name: true,
          slug: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      order: {
        select: {
          number: true,
        },
      },
    },
  });

  return NextResponse.json({ reviews });
}

export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await req.json();
  const id = String(body.id || "");
  const status = String(body.status || "");

  if (!id || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json(
      { error: "Valid review id and status are required." },
      { status: 400 },
    );
  }

  const review = await getPrisma().review.update({
    where: { id },
    data: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
  });

  return NextResponse.json({ review });
}
