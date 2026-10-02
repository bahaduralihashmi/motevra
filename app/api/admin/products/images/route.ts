import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
import { uploadStorageObject, deleteStorageObject } from "@/lib/supabase-storage";

export const runtime = "nodejs";

const MAX_FILES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const deny = () =>
  NextResponse.json({ error: "Admin access required." }, { status: 403 });

export async function GET(req: NextRequest) {
  if (!(await getAdminUser())) return deny();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Image id is required." }, { status: 400 });
  try {
    const image = await getPrisma().productImage.findUnique({ where: { id } });
    if (!image) return NextResponse.json({ error: "Image not found." }, { status: 404 });
    if (!image.url.startsWith("supabase://")) return NextResponse.redirect(image.url);
    const { resolveImageUrl } = await import("@/lib/supabase-storage");
    const url = await resolveImageUrl(image.url, 900);
    return NextResponse.redirect(url);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load image." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) return deny();

  const form = await req.formData();
  const productId = String(form.get("productId") || "").trim();
  const files = form.getAll("files").filter((value): value is File => value instanceof File);

  if (!productId) {
    return NextResponse.json({ error: "Product id is required." }, { status: 400 });
  }
  if (!files.length) {
    return NextResponse.json({ error: "Choose at least one image." }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `You can upload up to ${MAX_FILES} images at once.` }, { status: 400 });
  }

  const prisma = getPrisma();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product was not found." }, { status: 404 });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `${file.name}: use JPG, PNG, WebP or AVIF images.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `${file.name}: maximum image size is 8 MB.` },
        { status: 400 },
      );
    }
  }

  const existingCount = await prisma.productImage.count({ where: { productId } });
  const uploaded: Array<{ id: string; url: string; alt: string | null; position: number }> = [];

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension =
        file.type === "image/jpeg"
          ? "jpg"
          : file.type === "image/png"
            ? "png"
            : file.type === "image/webp"
              ? "webp"
              : "avif";
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80) || "product-image";
      const path = `products/${productId}/${crypto.randomUUID()}-${safeName.replace(/\.[^.]+$/, "")}.${extension}`;
      const reference = await uploadStorageObject(path, file, file.type);
      const image = await prisma.productImage.create({
        data: {
          url: reference,
          alt: product.name,
          position: existingCount + index,
          product: { connect: { id: productId } },
        },
        select: { id: true, url: true, alt: true, position: true },
      });
      uploaded.push(image);
    }

    return NextResponse.json({ images: uploaded }, { status: 201 });
  } catch (error) {
    for (const image of uploaded) {
      try {
        await prisma.productImage.delete({ where: { id: image.id } });
        await deleteStorageObject(image.url);
      } catch {}
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to upload product images." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await getAdminUser())) return deny();

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Image id is required." }, { status: 400 });
  }

  try {
    const prisma = getPrisma();
    const image = await prisma.productImage.findUnique({ where: { id } });
    if (!image) return NextResponse.json({ error: "Image not found." }, { status: 404 });

    await prisma.productImage.delete({ where: { id } });
    try {
      await deleteStorageObject(image.url);
    } catch (error) {
      console.error("[MOTEVRA storage] object cleanup failed", error);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete image." },
      { status: 400 },
    );
  }
}
