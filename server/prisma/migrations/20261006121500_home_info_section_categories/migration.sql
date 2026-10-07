CREATE TABLE "HomeInfoSectionCategory" (
  "homePageSettingsId" UUID NOT NULL,
  "categoryId" UUID NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "HomeInfoSectionCategory_pkey" PRIMARY KEY ("homePageSettingsId", "categoryId")
);
CREATE INDEX "HomeInfoSectionCategory_categoryId_idx" ON "HomeInfoSectionCategory"("categoryId");
CREATE INDEX "HomeInfoSectionCategory_homePageSettingsId_sortOrder_idx" ON "HomeInfoSectionCategory"("homePageSettingsId", "sortOrder");
ALTER TABLE "HomeInfoSectionCategory" ADD CONSTRAINT "HomeInfoSectionCategory_homePageSettingsId_fkey" FOREIGN KEY ("homePageSettingsId") REFERENCES "HomePageSettings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HomeInfoSectionCategory" ADD CONSTRAINT "HomeInfoSectionCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NewsCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "HomeInfoSectionCategory" ("homePageSettingsId", "categoryId", "sortOrder")
SELECT "id", "infoSectionCategoryId", 0
FROM "HomePageSettings"
WHERE "infoSectionCategoryId" IS NOT NULL
ON CONFLICT DO NOTHING;
