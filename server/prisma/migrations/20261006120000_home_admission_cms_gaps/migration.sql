ALTER TABLE "Faq" ADD COLUMN "isAdmissionFaq" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Faq" ADD COLUMN "admissionSortOrder" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "Faq_isAdmissionFaq_admissionSortOrder_idx" ON "Faq"("isAdmissionFaq", "admissionSortOrder");

CREATE TABLE "HomePageSettings" (
  "id" UUID NOT NULL,
  "infoSectionTitle" VARCHAR(255) NOT NULL DEFAULT 'Information for every step.',
  "infoSectionCategoryId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomePageSettings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "HomePageSettings_infoSectionCategoryId_idx" ON "HomePageSettings"("infoSectionCategoryId");
ALTER TABLE "HomePageSettings" ADD CONSTRAINT "HomePageSettings_infoSectionCategoryId_fkey" FOREIGN KEY ("infoSectionCategoryId") REFERENCES "NewsCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CampusSpotlight" (
  "id" UUID NOT NULL,
  "text" TEXT NOT NULL,
  "cite" VARCHAR(255) NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "activeFrom" TIMESTAMP(3),
  "activeUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CampusSpotlight_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CampusSpotlight_isActive_sortOrder_idx" ON "CampusSpotlight"("isActive", "sortOrder");
