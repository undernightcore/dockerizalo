-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "max" INTEGER,
ADD COLUMN     "min" INTEGER;

-- UpdateData
UPDATE "Setting" SET min = 1, max = 10 WHERE name = 'MAX_IMAGES';