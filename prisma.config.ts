import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Vercel's Prisma Postgres integration provides DATABASE_URL.
    // Prisma Postgres includes connection pooling, so no separate
    // Neon-style pooler/direct URL pair is required here.
    url: env("DATABASE_URL"),
  },
});
