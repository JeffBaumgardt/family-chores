-- AlterTable
ALTER TABLE "Reward" ADD COLUMN     "redeemed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redeemedAt" TIMESTAMP(3),
ADD COLUMN     "redeemedBy" TEXT;
