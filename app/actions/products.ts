"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const productSchema = z.object({
  name: z.string().min(3),
  slug: z.string().min(2),
  sku: z.string().min(2),
  brand: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(1),
  stock: z.coerce.number().min(0),
  description: z.string().min(10),
  imageUrls: z.array(z.string().refine((value) => value.startsWith("/uploads/") || URL.canParse(value), "Invalid image URL.")).min(1).max(12),
  width: z.coerce.number().int().min(1).optional(),
  aspectRatio: z.coerce.number().int().min(1).optional(),
  rimSize: z.coerce.number().int().min(1).optional(),
  constructionType: z.string().min(1).max(3).optional(),
  loadIndex: z.coerce.number().int().min(1).optional(),
  speedRating: z.string().max(3).optional(),
  season: z.enum(["SUMMER", "WINTER", "ALL_SEASON", "STUDDED", "RAIN"]).optional(),
  tyreType: z.enum(["PASSENGER", "SUV", "LIGHT_TRUCK", "PERFORMANCE"]).optional(),
  condition: z.enum(["NEW", "USED", "TAKE_OFF"]).optional(),
  treadDepth: z.coerce.number().min(0).optional(),
  dotCode: z.string().regex(/^\d{4}$/).optional(),
  quantityUnit: z.enum(["SINGLE", "PAIR", "SET_OF_FOUR"]).optional(),
  runFlat: z.coerce.boolean().optional(),
  repairs: z.coerce.boolean().optional(),
  repairDescription: z.string().optional(),
  deliveryOptions: z.array(z.enum(["LOCAL_PICKUP", "FREIGHT_SHIPPING"])).optional(),
});

export async function createProduct(formData: FormData) {
  const uploadedUrls: string[] = [];
  const files = formData.getAll("imageFiles").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length) {
    const uploadDirectory = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDirectory, { recursive: true });
    for (const file of files.slice(0, 12)) {
      if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed.");
      const extension = path.extname(file.name).toLowerCase() || ".jpg";
      const filename = `${randomUUID()}${extension}`;
      await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));
      uploadedUrls.push(`/uploads/${filename}`);
    }
  }

  const payload = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    brand: formData.get("brand"),
    category: formData.get("category"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    description: formData.get("description"),
    imageUrls: [...formData.getAll("imageUrls"), ...uploadedUrls].filter((value): value is string => typeof value === "string" && value.trim().length > 0),
    width: formData.get("width") || undefined,
    aspectRatio: formData.get("aspectRatio") || undefined,
    rimSize: formData.get("rimSize") || undefined,
    constructionType: formData.get("constructionType") || undefined,
    loadIndex: formData.get("loadIndex") || undefined,
    speedRating: formData.get("speedRating") || undefined,
    season: formData.get("season") || undefined,
    tyreType: formData.get("tyreType") || undefined,
    condition: formData.get("condition") || undefined,
    treadDepth: formData.get("treadDepth") || undefined,
    dotCode: formData.get("dotCode") || undefined,
    quantityUnit: formData.get("quantityUnit") || undefined,
    runFlat: formData.get("runFlat") || undefined,
    repairs: formData.get("repairs") || undefined,
    repairDescription: formData.get("repairDescription") || undefined,
    deliveryOptions: formData.getAll("deliveryOptions"),
  });

  if (!payload.success) {
    throw new Error("Invalid product data.");
  }

  const { name, slug, sku, brand, category, price, stock, description, imageUrls, width, aspectRatio, rimSize, constructionType, loadIndex, speedRating, season, tyreType, condition, treadDepth, dotCode, quantityUnit, runFlat, repairs, repairDescription, deliveryOptions } = payload.data;

  if (!process.env.DATABASE_URL) {
    MOCK_PRODUCTS.unshift({
      id: `mock-${Date.now()}`,
      slug,
      name,
      brand,
      category,
      price,
      salePrice: price,
      image: imageUrls[0],
      stock,
      rating: 4.8,
      badge: "New",
    });
    redirect("/admin/products");
  }

  const createdBrand = await db.brand.upsert({
    where: { name: brand },
    update: {},
    create: { name: brand, slug: brand.toLowerCase().replace(/\s+/g, "-") },
  });

  const createdCategory = await db.category.upsert({
    where: { name: category },
    update: {},
    create: { name: category, slug: category.toLowerCase().replace(/\s+/g, "-") },
  });

  await db.product.create({
    data: {
      sku,
      slug,
      name,
      description,
      price: String(price),
      salePrice: String(price),
      stock,
      brandId: createdBrand.id,
      categoryId: createdCategory.id,
      status: "ACTIVE",
      shippingClass: "STANDARD",
      countryAvailability: ["PKR", "USD"],
      isInternational: true,
      images: {
        create: imageUrls.map((url, index) => ({ url, altText: name, sortOrder: index })),
      },
      tyres: width && aspectRatio && rimSize ? { create: { width, aspectRatio, rimSize, constructionType, loadIndex, speedRating, season, tyreType, condition, treadDepth: treadDepth?.toString(), dotCode, quantityUnit, runFlat, repairs, repairDescription, deliveryOptions } } : undefined,
    },
  });

  redirect("/admin/products");
}
