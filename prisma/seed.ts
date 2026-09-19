import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "./generated/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not configured.");

const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "tyres" },
    update: {},
    create: { name: "Tyres", slug: "tyres" },
  });

  const brand = await prisma.brand.upsert({
    where: { slug: "motevra" },
    update: {},
    create: { name: "MOTEVRA", slug: "motevra" },
  });

  await prisma.product.upsert({
    where: { slug: "motevra-touring-pro" },
    update: {},
    create: {
      sku: "MOT-TOUR-001",
      slug: "motevra-touring-pro",
      name: "MOTEVRA Touring Pro",
      description: "Demo catalogue record used to verify the Phase B database connection.",
      price: "89.00",
      status: "ACTIVE",
      stock: 24,
      brandId: brand.id,
      categoryId: category.id,
      tyre: { create: { width: 205, aspectRatio: 55, rimSize: 16, loadIndex: 91, speedRating: "V", season: "ALL_SEASON" } },
    },
  });

  console.log("MOTEVRA Phase B seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(async () => prisma.$disconnect());
