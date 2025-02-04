/*
  Warnings:

  - A unique constraint covering the columns `[name,appId]` on the table `Network` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Network_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Network_name_appId_key" ON "Network"("name", "appId");
