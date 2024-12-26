/*
  Warnings:

  - Added the required column `appId` to the `Build` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Build" ADD COLUMN     "appId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
