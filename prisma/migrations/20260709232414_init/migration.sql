-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT', 'ACCOUNTANT');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'TOWNHOUSE', 'COMMERCIAL', 'OFFICE', 'LAND', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'PREVIOUS');

-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CRITICAL', 'EXPIRING_SOON', 'TERMINATED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Landlord" (
    "id" SERIAL NOT NULL,
    "displayName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "commissionRate" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Landlord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "propertyCode" TEXT NOT NULL,
    "propertyName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "suburb" TEXT,
    "city" TEXT,
    "province" TEXT,
    "postalCode" TEXT,
    "propertyType" "PropertyType" NOT NULL DEFAULT 'OTHER',
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "landlordId" INTEGER,
    "parentPropertyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "status" "TenantStatus" NOT NULL,
    "notes" TEXT,
    "propertyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "monthlyRent" DECIMAL(12,2) NOT NULL,
    "depositHeld" DECIMAL(12,2),
    "status" "LeaseStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3),
    "leaseReference" TEXT,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentPayment" (
    "id" SERIAL NOT NULL,
    "leaseId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amountDue" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2),
    "paymentDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" SERIAL NOT NULL,
    "contractorName" TEXT NOT NULL,
    "speciality" TEXT,
    "description" TEXT,
    "beneficiaryNumber" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "contractorId" INTEGER,
    "tenantId" INTEGER,
    "issueDescription" TEXT NOT NULL,
    "priority" "MaintenancePriority" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL,
    "invoiceDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "cost" DECIMAL(12,2),
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatesAndLevy" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatesAndLevy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatesAndLevyEntry" (
    "id" SERIAL NOT NULL,
    "ratesAndLevyId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RatesAndLevyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoveRecord" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "moveInDate" TIMESTAMP(3),
    "moveOutDate" TIMESTAMP(3),
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MoveRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertDocument" (
    "id" SERIAL NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Landlord_email_key" ON "Landlord"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Property_propertyCode_key" ON "Property"("propertyCode");

-- CreateIndex
CREATE INDEX "Property_landlordId_idx" ON "Property"("landlordId");

-- CreateIndex
CREATE INDEX "Property_parentPropertyId_idx" ON "Property"("parentPropertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_email_key" ON "Tenant"("email");

-- CreateIndex
CREATE INDEX "Tenant_propertyId_idx" ON "Tenant"("propertyId");

-- CreateIndex
CREATE INDEX "Lease_propertyId_idx" ON "Lease"("propertyId");

-- CreateIndex
CREATE INDEX "Lease_tenantId_idx" ON "Lease"("tenantId");

-- CreateIndex
CREATE INDEX "RentPayment_leaseId_idx" ON "RentPayment"("leaseId");

-- CreateIndex
CREATE UNIQUE INDEX "RentPayment_leaseId_month_year_key" ON "RentPayment"("leaseId", "month", "year");

-- CreateIndex
CREATE INDEX "Maintenance_propertyId_idx" ON "Maintenance"("propertyId");

-- CreateIndex
CREATE INDEX "Maintenance_contractorId_idx" ON "Maintenance"("contractorId");

-- CreateIndex
CREATE INDEX "RatesAndLevy_propertyId_idx" ON "RatesAndLevy"("propertyId");

-- CreateIndex
CREATE INDEX "RatesAndLevyEntry_ratesAndLevyId_idx" ON "RatesAndLevyEntry"("ratesAndLevyId");

-- CreateIndex
CREATE UNIQUE INDEX "RatesAndLevyEntry_ratesAndLevyId_month_year_key" ON "RatesAndLevyEntry"("ratesAndLevyId", "month", "year");

-- CreateIndex
CREATE INDEX "MoveRecord_propertyId_idx" ON "MoveRecord"("propertyId");

-- CreateIndex
CREATE INDEX "MoveRecord_tenantId_idx" ON "MoveRecord"("tenantId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "Landlord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_parentPropertyId_fkey" FOREIGN KEY ("parentPropertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentPayment" ADD CONSTRAINT "RentPayment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatesAndLevy" ADD CONSTRAINT "RatesAndLevy_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatesAndLevyEntry" ADD CONSTRAINT "RatesAndLevyEntry_ratesAndLevyId_fkey" FOREIGN KEY ("ratesAndLevyId") REFERENCES "RatesAndLevy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveRecord" ADD CONSTRAINT "MoveRecord_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoveRecord" ADD CONSTRAINT "MoveRecord_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertDocument" ADD CONSTRAINT "PropertDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
