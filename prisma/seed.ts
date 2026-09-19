import { PrismaPg } from "@prisma/adapter-pg";
import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be configured before running the seed.");
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

const products = [
  {
    sku: "MOT-CONTI-PC6-2055516",
    slug: "continental-premiumcontact-6",
    name: "Continental PremiumContact 6",
    brand: "Continental",
    category: "Summer Tyres",
    description: "Premium touring tyre designed for confident wet braking and comfortable daily driving.",
    price: 43500,
    salePrice: 39900,
    stock: 24,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
    badge: "Best seller",
    tyre: { width: 205, aspectRatio: 55, rimSize: 16, season: "SUMMER" as const, tyreType: "PASSENGER" as const },
  },
  {
    sku: "MOT-BRIDGE-TUR-2254517",
    slug: "bridgestone-turanza",
    name: "Bridgestone Turanza",
    brand: "Bridgestone",
    category: "Touring",
    description: "Balanced touring tyre with smooth road manners and dependable everyday performance.",
    price: 48200,
    salePrice: 44700,
    stock: 18,
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80",
    badge: "New",
    tyre: { width: 225, aspectRatio: 45, rimSize: 17, season: "ALL_SEASON" as const, tyreType: "PASSENGER" as const },
  },
  {
    sku: "MOT-MICH-PRI-2254517",
    slug: "michelin-primacy-4",
    name: "Michelin Primacy 4",
    brand: "Michelin",
    category: "All Season",
    description: "Long-lasting premium tyre engineered for quiet comfort and consistent grip.",
    price: 52000,
    salePrice: 47300,
    stock: 31,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    badge: "Top rated",
    tyre: { width: 225, aspectRatio: 45, rimSize: 17, season: "ALL_SEASON" as const, tyreType: "PASSENGER" as const },
  },
  {
    sku: "MOT-PIRE-PZERO-2454018",
    slug: "pirelli-p-zero",
    name: "Pirelli P Zero",
    brand: "Pirelli",
    category: "Performance",
    description: "Performance-focused tyre for responsive handling and high-speed road confidence.",
    price: 58700,
    salePrice: 53950,
    stock: 12,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    badge: "Performance",
    tyre: { width: 245, aspectRatio: 40, rimSize: 18, season: "SUMMER" as const, tyreType: "PERFORMANCE" as const },
  },
];

async function main() {
  const passwordHash = await hash("Admin123!", 12);
  const customerPasswordHash = await hash("Driver123!", 12);

  await db.user.upsert({
    where: { email: "admin@motevra.com" },
    update: { name: "MOTEVRA Admin", passwordHash, role: "ADMIN", isActive: true },
    create: { email: "admin@motevra.com", name: "MOTEVRA Admin", passwordHash, role: "ADMIN" },
  });

  await db.user.upsert({
    where: { email: "driver@motevra.com" },
    update: { name: "Demo Driver", passwordHash: customerPasswordHash, role: "CUSTOMER", isActive: true },
    create: { email: "driver@motevra.com", name: "Demo Driver", passwordHash: customerPasswordHash, role: "CUSTOMER" },
  });

  for (const product of products) {
    const brand = await db.brand.upsert({
      where: { name: product.brand },
      update: { slug: product.brand.toLowerCase() },
      create: { name: product.brand, slug: product.brand.toLowerCase(), isFeatured: true },
    });
    const category = await db.category.upsert({
      where: { name: product.category },
      update: { slug: product.category.toLowerCase().replace(/\s+/g, "-") },
      create: { name: product.category, slug: product.category.toLowerCase().replace(/\s+/g, "-") },
    });
    const savedProduct = await db.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: String(product.price),
        salePrice: String(product.salePrice),
        stock: product.stock,
        brandId: brand.id,
        categoryId: category.id,
        status: "ACTIVE",
        isFeatured: true,
        isInternational: true,
        countryAvailability: ["PK", "AE", "GB", "US"],
      },
      create: {
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: String(product.price),
        salePrice: String(product.salePrice),
        stock: product.stock,
        brandId: brand.id,
        categoryId: category.id,
        status: "ACTIVE",
        isFeatured: true,
        isInternational: true,
        countryAvailability: ["PK", "AE", "GB", "US"],
      },
    });

    await db.productImage.deleteMany({ where: { productId: savedProduct.id } });
    await db.productImage.create({ data: { productId: savedProduct.id, url: product.image, altText: product.name } });
    await db.tyre.upsert({
      where: { productId: savedProduct.id },
      update: product.tyre,
      create: { productId: savedProduct.id, ...product.tyre },
    });

    await db.vehicleCompatibility.deleteMany({ where: { productId: savedProduct.id } });
    await db.vehicleCompatibility.createMany({
      data: [
        { productId: savedProduct.id, manufacturer: "Toyota", model: "Corolla", yearFrom: 2018, yearTo: 2024, recommendedTyreSize: `${product.tyre.width}/${product.tyre.aspectRatio} R${product.tyre.rimSize}` },
        { productId: savedProduct.id, manufacturer: "Honda", model: "Civic", yearFrom: 2017, yearTo: 2024, recommendedTyreSize: `${product.tyre.width}/${product.tyre.aspectRatio} R${product.tyre.rimSize}` },
      ],
    });
  }

  console.log(`Seeded ${products.length} products and demo users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });