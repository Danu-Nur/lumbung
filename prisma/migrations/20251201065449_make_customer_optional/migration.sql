-- DropForeignKey
ALTER TABLE "sales_orders" DROP CONSTRAINT "sales_orders_customerId_fkey";

-- AlterTable
ALTER TABLE "sales_orders" ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
