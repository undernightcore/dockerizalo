-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('VIEWER', 'EDITOR');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "AppMember" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "appId" TEXT NOT NULL,
    "role" "AppRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppMember_appId_userId_key" ON "AppMember"("appId", "userId");

-- AddForeignKey
ALTER TABLE "AppMember" ADD CONSTRAINT "AppMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppMember" ADD CONSTRAINT "AppMember_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Every user becomes administrator
UPDATE "User" SET "role" = 'ADMIN';
