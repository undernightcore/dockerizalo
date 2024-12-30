/*
  Warnings:

  - The primary key for the `App` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `BindMount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Build` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `EnvironmentVariable` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PortMapping` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Token` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "BindMount" DROP CONSTRAINT "BindMount_appId_fkey";

-- DropForeignKey
ALTER TABLE "Build" DROP CONSTRAINT "Build_appId_fkey";

-- DropForeignKey
ALTER TABLE "EnvironmentVariable" DROP CONSTRAINT "EnvironmentVariable_appId_fkey";

-- DropForeignKey
ALTER TABLE "PortMapping" DROP CONSTRAINT "PortMapping_appId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_appId_fkey";

-- AlterTable
ALTER TABLE "App" DROP CONSTRAINT "App_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "App_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "App_id_seq";

-- AlterTable
ALTER TABLE "BindMount" DROP CONSTRAINT "BindMount_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "appId" SET DATA TYPE TEXT,
ADD CONSTRAINT "BindMount_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BindMount_id_seq";

-- AlterTable
ALTER TABLE "Build" DROP CONSTRAINT "Build_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "appId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Build_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Build_id_seq";

-- AlterTable
ALTER TABLE "EnvironmentVariable" DROP CONSTRAINT "EnvironmentVariable_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "appId" SET DATA TYPE TEXT,
ADD CONSTRAINT "EnvironmentVariable_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "EnvironmentVariable_id_seq";

-- AlterTable
ALTER TABLE "PortMapping" DROP CONSTRAINT "PortMapping_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "appId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PortMapping_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PortMapping_id_seq";

-- AlterTable
ALTER TABLE "Token" DROP CONSTRAINT "Token_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "appId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Token_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Token_id_seq";

-- AddForeignKey
ALTER TABLE "PortMapping" ADD CONSTRAINT "PortMapping_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BindMount" ADD CONSTRAINT "BindMount_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentVariable" ADD CONSTRAINT "EnvironmentVariable_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
