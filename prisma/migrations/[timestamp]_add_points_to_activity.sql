-- Add points and name columns to Activity
ALTER TABLE "Activity" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Activity" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

-- Remove the default values after adding the columns
ALTER TABLE "Activity" ALTER COLUMN "points" DROP DEFAULT;
ALTER TABLE "Activity" ALTER COLUMN "name" DROP DEFAULT; 