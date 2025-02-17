/*
  Warnings:

  - You are about to drop the column `rewardId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `points` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_rewardId_fkey";

-- DropIndex
DROP INDEX "Activity_rewardId_idx";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "rewardId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "points" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Reward";
