/*
  Warnings:

  - A unique constraint covering the columns `[razorpayId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyUsage" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_razorpayId_key" ON "Transaction"("razorpayId");
