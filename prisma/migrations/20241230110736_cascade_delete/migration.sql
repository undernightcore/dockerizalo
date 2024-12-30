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

-- AddForeignKey
ALTER TABLE "PortMapping" ADD CONSTRAINT "PortMapping_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BindMount" ADD CONSTRAINT "BindMount_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentVariable" ADD CONSTRAINT "EnvironmentVariable_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Build" ADD CONSTRAINT "Build_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
