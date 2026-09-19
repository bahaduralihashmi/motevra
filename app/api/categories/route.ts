import { NextResponse } from "next/server"; import { getPrisma } from "@/lib/prisma";
export const runtime="nodejs";
export async function GET(){const categories=await getPrisma().category.findMany({orderBy:{name:"asc"},include:{_count:{select:{products:true}}}});return NextResponse.json({categories});}