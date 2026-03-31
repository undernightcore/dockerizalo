-- DropForeignKey
ALTER TABLE "Trigger" DROP CONSTRAINT "Trigger_appId_fkey";

-- AddForeignKey
ALTER TABLE "Trigger" ADD CONSTRAINT "Trigger_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE CASCADE ON UPDATE CASCADE;
