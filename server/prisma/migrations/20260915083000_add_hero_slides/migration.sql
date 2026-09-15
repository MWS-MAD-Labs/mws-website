DO $$
BEGIN
  CREATE TYPE "HeroSlideMediaType" AS ENUM ('IMAGE', 'VIDEO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "HeroSlideSourceType" AS ENUM (
    'MANUAL',
    'PROGRAM',
    'ADMISSION',
    'CAMPUS_TOUR',
    'CURRICULUM',
    'AFFILIATION',
    'ACADEMIC',
    'KINDERGARTEN',
    'ELEMENTARY',
    'JUNIOR_HIGH',
    'OUR_SCHOOL',
    'CONTACT'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "HeroSlide" (
  "id" UUID NOT NULL,
  "sourceType" "HeroSlideSourceType" NOT NULL DEFAULT 'MANUAL',
  "sourceId" UUID,
  "title" VARCHAR(255),
  "description" TEXT,
  "caption" TEXT,
  "mediaType" "HeroSlideMediaType",
  "mediaPath" VARCHAR(1000),
  "mediaAlt" VARCHAR(255),
  "posterPath" VARCHAR(1000),
  "isLooping" BOOLEAN NOT NULL DEFAULT true,
  "ctaLabel" VARCHAR(100),
  "ctaUrl" VARCHAR(1000),
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);
