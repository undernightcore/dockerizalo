/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Token` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Token_value_key";

-- AlterTable
ALTER TABLE "Token" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Token_name_key" ON "Token"("name");
