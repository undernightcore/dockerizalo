/*
  Warnings:

  - Changed the type of `build` on the `EnvironmentVariable` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "EnvironmentVariable" DROP COLUMN "build",
ADD COLUMN     "build" BOOLEAN NOT NULL;
