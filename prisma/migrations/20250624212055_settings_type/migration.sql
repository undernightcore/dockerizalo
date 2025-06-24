-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'INTEGER', 'BOOLEAN');

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN "type" "SettingType" NOT NULL DEFAULT 'STRING';

-- UpdateData
UPDATE "Setting" SET type = 'INTEGER' WHERE name = 'MAX_IMAGES';
