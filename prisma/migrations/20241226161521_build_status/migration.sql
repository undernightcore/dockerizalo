-- CreateEnum
CREATE TYPE "Status" AS ENUM ('BUILDING', 'FAILED', 'SUCCESS');

-- AlterTable
ALTER TABLE "Build" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'BUILDING';
