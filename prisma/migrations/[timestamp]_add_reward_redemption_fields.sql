-- AlterTable
ALTER TABLE "Reward" ADD COLUMN "redeemed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Reward" ADD COLUMN "redeemedAt" TIMESTAMP;
ALTER TABLE "Reward" ADD COLUMN "redeemedBy" TEXT;

-- CreateIndex
CREATE INDEX "Reward_redeemedBy_idx" ON "Reward"("redeemedBy"); 