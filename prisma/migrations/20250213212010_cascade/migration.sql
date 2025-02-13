-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_appId_fkey";

-- DropForeignKey
ALTER TABLE "Network" DROP CONSTRAINT "Network_appId_fkey";

-- AddForeignKey
ALTER TABLE "Network" ADD CONSTRAINT "Network_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
