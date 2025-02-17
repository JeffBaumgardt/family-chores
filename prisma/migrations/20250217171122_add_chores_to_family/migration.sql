/*
  Warnings:

  - Added the required column `familyId` to the `Chore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chore" ADD COLUMN     "familyId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Chore_familyId_idx" ON "Chore"("familyId");

-- AddForeignKey
ALTER TABLE "Chore" ADD CONSTRAINT "Chore_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
