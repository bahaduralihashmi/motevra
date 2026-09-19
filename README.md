# MOTEVRA

International-ready automotive e-commerce platform.

## Phase C — Automotive catalogue & tyre finder

Implemented on `motevra-all-phases`:
- Prisma automotive catalogue models for products, brands, categories and tyre sizes
- Vehicle make → model → variant → year structure
- Vehicle-to-tyre fitment relations
- Real database-backed product, brand and category APIs
- Database-backed tyre search API
- Vehicle-aware tyre finder UI
- Product detail route
- Development seed data for Toyota Corolla and 205/55 R16
- Currency is stored per product/order; the seed uses USD to avoid hard-coding Pakistan into the product domain

The compatibility data is development/demo data only. Production fitment data should be imported from a verified automotive data provider or maintained by MOTEVRA administrators.

## Local setup

1. Copy `.env.example` to `.env`.
2. Configure Neon `DATABASE_URL`, `DIRECT_URL`, and Auth.js variables.
3. Install dependencies with `npm install`.
4. Generate Prisma client: `npm run db:generate`.
5. Create the first migration against your Neon database: `npm run db:migrate -- --name init`.
6. Seed development data: `npm run db:seed`.
7. Start: `npm run dev`.

Phase C does not claim that a database has been provisioned or that migrations/build/lint have been executed in this environment.
