-- Drop foreign key constraints first
ALTER TABLE "Activity" DROP CONSTRAINT IF EXISTS "Activity_rewardId_fkey";

-- Drop the rewardId column from Activity
ALTER TABLE "Activity" DROP COLUMN "rewardId";

-- Drop the Reward table
DROP TABLE "Reward"; 