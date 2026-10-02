import { NextRequest, NextResponse } from "next/server";
import { parseStorageReference } from "@/lib/supabase-storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("ref") || "";
    const parsed = parseStorageReference(reference);
    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/$/, "");
    const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
    if (!parsed || parsed.bucket !== bucket || !parsed.path.startsWith("products/")) return NextResponse.json({ error: "Invalid product image reference." }, { status: 400 });
    if (!baseUrl || !secretKey) return NextResponse.json({ error: "Supabase Storage is not configured." }, { status: 500 });
    const headers: Record<string,string> = { apikey: secretKey };
    if (!secretKey.startsWith("sb_secret_")) headers.Authorization = `Bearer ${secretKey}`;
    const path = parsed.path.split("/").map(encodeURIComponent).join("/");
    const response = await fetch(`${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${path}`, { headers, cache:"no-store" });
    if (!response.ok) return new NextResponse(await response.text(), { status: response.status, headers: {"Content-Type":"application/json"} });
    return new NextResponse(response.body, { status:200, headers: {
      "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      "Cache-Control":"public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"
    }});
  } catch (error) {
    console.error("[MOTEVRA product image]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to serve product image." }, { status: 500 });
  }
}
