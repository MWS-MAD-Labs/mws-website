-- Keep public academic pages on the last published snapshot while admins edit drafts.
ALTER TABLE "Kindergarten" ADD COLUMN "publishedTitle" VARCHAR(255);
ALTER TABLE "Kindergarten" ADD COLUMN "publishedDescription" TEXT;
ALTER TABLE "Kindergarten" ADD COLUMN "publishedCoverImage" VARCHAR(1000);
ALTER TABLE "Kindergarten" ADD COLUMN "publishedGalleryId" UUID;
ALTER TABLE "Kindergarten" ADD COLUMN "publishedHero" JSONB;
ALTER TABLE "Kindergarten" ADD COLUMN "publishedOverview" JSONB;
ALTER TABLE "Kindergarten" ADD COLUMN "publishedSections" JSONB;

ALTER TABLE "Elementary" ADD COLUMN "publishedTitle" VARCHAR(255);
ALTER TABLE "Elementary" ADD COLUMN "publishedDescription" TEXT;
ALTER TABLE "Elementary" ADD COLUMN "publishedCoverImage" VARCHAR(1000);
ALTER TABLE "Elementary" ADD COLUMN "publishedGalleryId" UUID;
ALTER TABLE "Elementary" ADD COLUMN "publishedHero" JSONB;
ALTER TABLE "Elementary" ADD COLUMN "publishedOverview" JSONB;
ALTER TABLE "Elementary" ADD COLUMN "publishedSections" JSONB;

ALTER TABLE "JuniorHigh" ADD COLUMN "publishedTitle" VARCHAR(255);
ALTER TABLE "JuniorHigh" ADD COLUMN "publishedDescription" TEXT;
ALTER TABLE "JuniorHigh" ADD COLUMN "publishedCoverImage" VARCHAR(1000);
ALTER TABLE "JuniorHigh" ADD COLUMN "publishedGalleryId" UUID;
ALTER TABLE "JuniorHigh" ADD COLUMN "publishedHero" JSONB;
ALTER TABLE "JuniorHigh" ADD COLUMN "publishedOverview" JSONB;
ALTER TABLE "JuniorHigh" ADD COLUMN "publishedSections" JSONB;

UPDATE "Kindergarten"
SET
  "publishedTitle" = "title",
  "publishedDescription" = "description",
  "publishedCoverImage" = "coverImage",
  "publishedGalleryId" = "galleryId",
  "publishedHero" = "hero",
  "publishedOverview" = "overview",
  "publishedSections" = "sections"
WHERE "status" = 'PUBLISHED';

UPDATE "Elementary"
SET
  "publishedTitle" = "title",
  "publishedDescription" = "description",
  "publishedCoverImage" = "coverImage",
  "publishedGalleryId" = "galleryId",
  "publishedHero" = "hero",
  "publishedOverview" = "overview",
  "publishedSections" = "sections"
WHERE "status" = 'PUBLISHED';

UPDATE "JuniorHigh"
SET
  "publishedTitle" = "title",
  "publishedDescription" = "description",
  "publishedCoverImage" = "coverImage",
  "publishedGalleryId" = "galleryId",
  "publishedHero" = "hero",
  "publishedOverview" = "overview",
  "publishedSections" = "sections"
WHERE "status" = 'PUBLISHED';

-- Keep Our School public data on one canonical row without deleting old rows.
ALTER TABLE "OurSchool" ADD COLUMN "singletonKey" VARCHAR(40);

WITH ranked AS (
  SELECT "id", row_number() OVER (ORDER BY "updatedAt" DESC, "createdAt" DESC) AS rn
  FROM "OurSchool"
)
UPDATE "OurSchool"
SET "singletonKey" = 'main'
FROM ranked
WHERE "OurSchool"."id" = ranked."id" AND ranked.rn = 1;

ALTER TABLE "OurSchool" ALTER COLUMN "singletonKey" SET DEFAULT 'main';
CREATE UNIQUE INDEX "OurSchool_singletonKey_key" ON "OurSchool"("singletonKey");
