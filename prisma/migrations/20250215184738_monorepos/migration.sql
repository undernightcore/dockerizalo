-- AlterTable
ALTER TABLE "App" ADD COLUMN     "contextPath" TEXT NOT NULL DEFAULT '/',
ADD COLUMN     "filePath" TEXT NOT NULL DEFAULT '/Dockerfile';
