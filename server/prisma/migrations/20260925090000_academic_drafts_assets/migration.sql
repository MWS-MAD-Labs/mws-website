ALTER TABLE "AcademicLevelPage"
  ADD COLUMN "status" VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "draftProgram" JSONB,
  ADD COLUMN "draftHero" JSONB,
  ADD COLUMN "draftOverview" JSONB,
  ADD COLUMN "draftSections" JSONB,
  ADD COLUMN "draftFaq" JSONB,
  ADD COLUMN "draftGalleryId" UUID,
  ADD COLUMN "draftSavedAt" TIMESTAMP(3);

UPDATE "AcademicLevelPage"
SET "publishedAt" = COALESCE("publishedAt", "updatedAt")
WHERE "isPublished" = true;
