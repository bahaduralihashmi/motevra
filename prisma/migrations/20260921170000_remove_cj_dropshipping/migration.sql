-- Remove legacy CJdropshipping fields from the production database.
-- Keep ProductVariant and Product.source because they are generic MOTEVRA commerce concepts.

DROP INDEX IF EXISTS "Product_cjProductId_key";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "cjProductId";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "cjProductSku";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "cjSyncedAt";

DROP INDEX IF EXISTS "ProductVariant_cjVariantId_key";
ALTER TABLE "ProductVariant" DROP COLUMN IF EXISTS "cjVariantId";
