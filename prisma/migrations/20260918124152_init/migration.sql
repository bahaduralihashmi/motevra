-- CreateEnum
CREATE TYPE "TireCondition" AS ENUM ('NEW', 'USED', 'TAKE_OFF');

-- CreateEnum
CREATE TYPE "QuantityUnit" AS ENUM ('SINGLE', 'PAIR', 'SET_OF_FOUR');

-- CreateEnum
CREATE TYPE "DeliveryOption" AS ENUM ('LOCAL_PICKUP', 'FREIGHT_SHIPPING');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK_ACCOUNT', 'JAZZCASH');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerEmail" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "sellerId" TEXT;

-- AlterTable
ALTER TABLE "Tyre" ADD COLUMN     "condition" "TireCondition" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "constructionType" TEXT NOT NULL DEFAULT 'R',
ADD COLUMN     "deliveryOptions" "DeliveryOption"[] DEFAULT ARRAY[]::"DeliveryOption"[],
ADD COLUMN     "dotCode" TEXT,
ADD COLUMN     "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'SINGLE',
ADD COLUMN     "repairDescription" TEXT,
ADD COLUMN     "repairs" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "treadDepth" DECIMAL(5,2);

-- CreateTable
CREATE TABLE "SellerPayoutAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" "PayoutMethod" NOT NULL,
    "accountName" TEXT NOT NULL,
    "iban" TEXT,
    "jazzCashPhone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerPayoutAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerPayoutAccount_userId_method_idx" ON "SellerPayoutAccount"("userId", "method");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerPayoutAccount" ADD CONSTRAINT "SellerPayoutAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
