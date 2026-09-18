-- AlterTable
ALTER TABLE "Program"
ADD COLUMN "ageRange" VARCHAR(100),
ADD COLUMN "imagePath" VARCHAR(1000),
ADD COLUMN "imageAlt" VARCHAR(255),
ADD COLUMN "path" VARCHAR(500),
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Admission"
ADD COLUMN "adminWhatsapp" VARCHAR(100),
ADD COLUMN "contactLabel" VARCHAR(100),
ADD COLUMN "exploreLabel" VARCHAR(100),
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "OurSchool"
ADD COLUMN "content" JSONB;

-- CreateTable
CREATE TABLE "CmsPage" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "body" JSONB NOT NULL,
    "template" VARCHAR(100),
    "status" VARCHAR(50),
    "publishedAt" TIMESTAMP(3),
    "createdBy" UUID,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityStoriesPage" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "heroImagePath" VARCHAR(1000),
    "heroImageAlt" VARCHAR(255),
    "introTitle" VARCHAR(500),
    "introBody" JSONB,
    "galleryId" UUID,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityStoriesPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityVoice" (
    "id" UUID NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "grade" VARCHAR(255),
    "quote" TEXT NOT NULL,
    "imagePath" VARCHAR(1000) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityVoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPost" (
    "id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "slug" VARCHAR(500) NOT NULL,
    "excerpt" TEXT,
    "imagePath" VARCHAR(1000),
    "imageAlt" VARCHAR(255),
    "galleryId" UUID,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_slug_key" ON "CmsPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsPost_slug_key" ON "NewsPost"("slug");

-- AddForeignKey
ALTER TABLE "CmsPage" ADD CONSTRAINT "CmsPage_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityStoriesPage" ADD CONSTRAINT "CommunityStoriesPage_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
