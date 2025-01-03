/*
  Warnings:

  - A unique constraint covering the columns `[key,appId]` on the table `EnvironmentVariable` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[external,appId]` on the table `PortMapping` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token,appId]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Token_token_key";

-- CreateIndex
CREATE UNIQUE INDEX "EnvironmentVariable_key_appId_key" ON "EnvironmentVariable"("key", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "PortMapping_external_appId_key" ON "PortMapping"("external", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_appId_key" ON "Token"("token", "appId");
