/*
  Warnings:

  - You are about to drop the column `value` on the `Token` table. All the data in the column will be lost.
  - Added the required column `password` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Token" DROP COLUMN "value",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
