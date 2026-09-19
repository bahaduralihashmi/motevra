# MOTEVRA
Premium international automotive marketplace.

## Implemented foundation
- Phase 1: premium responsive storefront, navigation, hero, tyre finder, categories, products, global shipping section and footer.
- Phase 2: product/catalog routes, cart persistence, tyre API, Prisma/PostgreSQL schema for products, tyres, vehicles and orders.
- Phase 3: account, checkout, order/tracking/returns routes and order API foundation.
- Phase 4: admin dashboard foundation for products, orders, customers, inventory, warehouses, payments, shipping, reviews, coupons, blog and analytics.
- Phase 5: country/currency choices and architecture for taxes, warehouses and destination-based shipping.
- Phase 6/7: metadata, Open Graph, canonical structure and content routes.

## Production activation
This repository is dependency-light and runnable immediately. For real commerce, connect PostgreSQL using prisma/schema.prisma, then add managed authentication, payment gateways (Pakistan first: COD/bank transfer/Easypaisa/JazzCash), email, object storage, search and shipping providers. Never put secrets in client code. Demo checkout does not create live orders.

## Validation
npm run dev
npm run lint
npm run build