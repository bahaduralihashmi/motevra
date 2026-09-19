# MOTEVRA

Premium automotive marketplace built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

## Local development

Install dependencies, then create a PostgreSQL database named `motevra`.

Create `.env.local` in the project root:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret
DATABASE_URL=postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/motevra
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Run the database setup from PowerShell or Command Prompt:

```text
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the app:

```text
npm run dev
```

The seed creates the initial brands, categories, products, tyre specifications, product images, and two development users:

- Admin: `admin@motevra.com` / `Admin123!`
- Customer: `driver@motevra.com` / `Driver123!`

Change these credentials before using a shared or deployed environment.

## Validation

```text
npm run lint
npm run build
```

Without `DATABASE_URL`, the app intentionally uses clearly scoped demo fallback data. Checkout does not claim to place orders until PostgreSQL is configured.
