# MOTEVRA Architecture

## 1. Product vision

MOTEVRA is a premium international automotive marketplace for tyres and future vehicle accessories. The platform is designed to scale from a Pakistan-first commerce model to a global storefront with multi-country shipping, local warehousing, and multi-currency checkout.

## 2. System principles

- Modular monolith first; no unnecessary microservices.
- Clear domain boundaries around catalog, commerce, users, shipping, and admin.
- Strong separation of server and client logic in Next.js App Router.
- Prisma + PostgreSQL as the system of record.
- Secure access patterns with auth, authorization, and validation at the server boundary.
- Search and merchandising optimized for product discovery and tyre compatibility.

## 3. Core modules

1. Authentication
   - Sign in, sign out, session management, password hashing through Auth.js provider.
   - Admin and customer role separation.

2. Users
   - Profiles, addresses, saved vehicles, account settings.

3. Products
   - Base catalog model, SKU management, status, pricing, search metadata.

4. Categories
   - Merchandising and navigation hierarchy.

5. Brands
   - Premium brand presentation and filtering.

6. Tyres
   - Tyre specification data such as width, aspect ratio, rim size, load and speed ratings, season, run-flat, and manufacturing metadata.

7. Vehicles
   - Manufacturer, model, year, engine, and compatibility data.

8. Vehicle compatibility
   - Mapping between vehicles and compatible tyre sizes.

9. Search
   - Global search, category search, tyre-size lookups, compatibility queries.

10. Cart
   - Session or user cart with line-item totals and pricing calculations.

11. Wishlist
   - Saved products and comparison-ready collections.

12. Checkout
   - Address selection, shipping, tax, payment methods, order summary.

13. Orders
   - Order lifecycle, order state, invoice data, line items.

14. Payments
   - COD, bank transfer, Easypaisa, JazzCash, expansion-ready payment integration layer.

15. Shipping
   - Shipping class, cost, country availability, warehouses, and shipment tracking.

16. Inventory
   - Stock movement and low-stock controls.

17. Warehouses
   - Multi-location fulfilment and reserved inventory.

18. Reviews
   - Ratings, review content, photos, moderation.

19. Coupons
   - Promo codes, discount rules, application logic.

20. Blog
   - Editorial content and storytelling around MOTEVRA.

21. Notifications
   - Customer and admin notifications.

22. Admin
   - Backend operations and merchandising controls.

23. Analytics
   - Sales, conversion, product performance, and shipping metrics.

## 4. Recommended app structure

```text
app/
  (marketing)/
  (shop)/
  (account)/
  admin/
  api/
components/
  ui/
  marketing/
  shop/
  admin/
lib/
  auth.ts
  db.ts
  validations/
  utils/
  constants/
prisma/
  schema.prisma
public/
  images/
```

## 5. Data architecture

- `Product` is the common catalog entity.
- `Tyre` extends the product with tyre-specific attributes.
- `Vehicle` and `VehicleCompatibility` enable size matching and fitment recommendations.
- `Inventory` records stock by warehouse, while `InventoryMovement` records all changes for auditability.
- `Order`, `OrderItem`, and `Payment` maintain a clean commerce ledger.
- `Review` and `ReviewImage` provide trust and conversion signals.

## 6. Internationalization and commerce

The system supports a global business model by storing:

- `country`
- `currency`
- `tax`
- `shippingCost`
- `shippingClass`
- `warehouse`
- `internationalAvailability`
- `destinationCountry`

This avoids hard-coding Pakistan as the only market while still supporting Pakistan-first payment methods at launch.

## 7. Security model

- Auth.js handles session management and secure authentication.
- Passwords are hashed by the provider and never stored as plain text.
- Server actions and route handlers validate input with Zod.
- Admin access is enforced via role checks and permission lookup.
- All secrets live in environment variables and are never exposed to the client.
- Data access should go through Prisma service functions rather than raw SQL.

## 8. SEO and performance

- Metadata at the route level using Next.js `generateMetadata`.
- Open Graph, Twitter cards, sitemap, robots, canonical URLs, and schema markup for products and organization pages.
- Product pages should use server components, static or incremental caching, and optimized image delivery.
- Search and product list pages should use pagination and filtering for efficient queries.

## 9. Phase 1 scope

Phase 1 covers the foundation only:

- project architecture and module map
- Prisma schema and normalized data model
- MOTEVRA design system and homepage experience
- reusable storefront components
- initial product category taxonomy and tyre-focused landing page
- environment and project conventions for future growth

Phase 2 and later will add authentication, checkout flow, admin dashboard, and live commerce logic.
