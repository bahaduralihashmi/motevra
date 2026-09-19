# MOTEVRA

MOTEVRA is a modern automotive marketplace for tyres, wheels, auto parts, accessories, batteries and car care.

## Phase status

### Phase A — Storefront foundation
Implemented on `motevra-all-phases`:
- Real MOTEVRA homepage instead of the Create Next App starter
- Reusable site header, footer and category-page components
- Dedicated App Router pages for primary catalog categories
- Responsive desktop/tablet/mobile design system
- MOTEVRA metadata, canonical URL, Open Graph foundation and robots rules
- Clean sitemap foundation
- International-ready storefront messaging without hard-coding the business model to one country
- `.env.example` reserved for the database/authentication phase

### Phase B — Database + authentication
Planned:
- Neon PostgreSQL
- Prisma
- Auth.js / NextAuth
- Products, categories, brands, inventory and customer accounts
- Seed data and real APIs

### Later phases
Payments, checkout, shipping, tyre/vehicle compatibility, admin, reviews, international taxes/currencies, analytics and production hardening.

## Architecture rule

Phase A intentionally does **not** wire database, authentication, payments or live commerce. The storefront is being established first so the later services can plug into a stable route and component system.

For authentication, the planned choice is Auth.js (commonly called NextAuth.js). For PostgreSQL, the planned hosted provider is Neon.

## Environment

Copy `.env.example` to `.env.local` when beginning Phase B. Never commit real secrets.

## Validation

Run locally:

```bash
npm install
npm run dev
npm run lint
npm run build
```
