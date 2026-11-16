-- CreateEnum
CREATE TYPE "MaintenancePaymentStatus" AS ENUM ('UNPAID', 'PAID');

-- AlterTable
ALTER TABLE "Maintenance" ADD COLUMN     "paymentStatus" "MaintenancePaymentStatus" DEFAULT 'UNPAID';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "managingAgent" TEXT;
