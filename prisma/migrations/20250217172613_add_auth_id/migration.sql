/*
  Warnings:

  - A unique constraint covering the columns `[auth_id]` on the table `FamilyMember` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FamilyMember" ADD COLUMN     "auth_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FamilyMember_auth_id_key" ON "FamilyMember"("auth_id");

-- CreateIndex
CREATE INDEX "FamilyMember_auth_id_idx" ON "FamilyMember"("auth_id");
