# MOTEVRA

MOTEVRA is a modern automotive marketplace for tyres, wheels, auto parts, accessories, batteries and car care.

## Phase B — Database + authentication

Implemented on `motevra-all-phases`:

- Prisma ORM 7 foundation
- Neon PostgreSQL configuration with pooled runtime URL and direct migration URL
- Prisma generated-client configuration
- Auth.js / NextAuth integration
- Prisma authentication adapter
- Google OAuth sign-in foundation
- Database-backed sessions
- Protected account/orders/admin route matcher
- Database health endpoint at `/api/health`
- Initial database seed for a MOTEVRA category, brand and demo tyre
- Environment template with secrets kept out of source code

The Neon database itself is **not provisioned or migrated by this repository commit**, because the real Neon connection string and OAuth credentials belong in your deployment environment.

## Phase B setup

1. Create a Neon PostgreSQL project.
2. Copy `.env.example` to `.env.local`.
3. Put the Neon pooled connection in `DATABASE_URL`.
4. Put the Neon direct connection in `DIRECT_URL`.
5. Create a Google OAuth application and set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
6. Generate a strong `AUTH_SECRET`.
7. Install dependencies and generate Prisma:

```bash
npm install
npm run db:validate
npm run db:generate
```

8. Create/apply the first migration:

```bash
npm run db:migrate -- --name init
npm run db:seed
```

For deployment migrations:

```bash
npm run db:deploy
```

## Important

Do not commit `.env.local`, Neon passwords, OAuth client secrets, or Auth.js secrets.

The current Google provider is an authentication foundation. Customer profiles, addresses, saved vehicles, orders, inventory, checkout and role-based admin operations will be connected in later phases.

## Architecture

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Auth.js / NextAuth
- Prisma ORM 7
- Neon PostgreSQL
- Vercel-ready server runtime
- International-ready country/currency architecture

## Validation

```bash
npm run lint
npm run db:validate
npm run db:generate
npm run build
```
