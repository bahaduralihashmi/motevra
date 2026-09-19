import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Prisma Postgres direct TCP connection for migrations and Prisma CLI.
    // Set DIRECT_URL in Vercel/local envs to the direct db.prisma.io URL.
    url: env("DIRECT_URL"),
  },
});
