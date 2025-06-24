-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Setting_name_key" ON "Setting"("name");

-- AddData
INSERT INTO "Setting" VALUES ('73ee8c7f-8310-4eb9-b704-3d638477d7d0', 'MAX_IMAGES', '3');
