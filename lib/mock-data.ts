// Temporary demo catalog data for Phase 2 storefront and admin flows.
// Replace with Prisma-backed data once database connectivity and seed scripts are enabled.

export type Role = "ADMIN" | "CUSTOMER";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  salePrice: number;
  image: string;
  stock: number;
  rating: number;
  badge: string;
};

export const DEMO_USERS: DemoUser[] = [
  {
    id: "admin-user-1",
    name: "MOTEVRA Admin",
    email: "admin@motevra.com",
    password: "Admin123!",
    role: "ADMIN",
  },
  {
    id: "customer-user-1",
    name: "Demo Driver",
    email: "driver@motevra.com",
    password: "Driver123!",
    role: "CUSTOMER",
  },
];

export const MOCK_PRODUCTS: ProductCard[] = [
  {
    id: "prod-1",
    slug: "continental-premiumcontact-6",
    name: "Continental PremiumContact 6",
    brand: "Continental",
    category: "Summer Tyres",
    price: 43500,
    salePrice: 39900,
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80",
    stock: 24,
    rating: 4.9,
    badge: "Best seller",
  },
  {
    id: "prod-2",
    slug: "bridgestone-turanza",
    name: "Bridgestone Turanza",
    brand: "Bridgestone",
    category: "Touring",
    price: 48200,
    salePrice: 44700,
    image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80",
    stock: 18,
    rating: 4.8,
    badge: "New",
  },
  {
    id: "prod-3",
    slug: "michelin-primacy-4",
    name: "Michelin Primacy 4",
    brand: "Michelin",
    category: "All Season",
    price: 52000,
    salePrice: 47300,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    stock: 31,
    rating: 5,
    badge: "Top rated",
  },
  {
    id: "prod-4",
    slug: "pirelli-p-zero",
    name: "Pirelli P Zero",
    brand: "Pirelli",
    category: "Performance",
    price: 58700,
    salePrice: 53950,
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80",
    stock: 12,
    rating: 4.9,
    badge: "Performance",
  },
];
