/*
  Warnings:

  - You are about to drop the column `galleryId` on the `NewsPost` table. All the data in the column will be lost.
  - You are about to drop the column `imageAlt` on the `NewsPost` table. All the data in the column will be lost.
  - You are about to drop the column `imagePath` on the `NewsPost` table. All the data in the column will be lost.
  - You are about to alter the column `title` on the `NewsPost` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(255)`.
  - You are about to alter the column `slug` on the `NewsPost` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(255)`.
  - Added the required column `content` to the `NewsPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NewsMediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- DropForeignKey
ALTER TABLE "NewsPost" DROP CONSTRAINT "NewsPost_galleryId_fkey";

-- AlterTable
ALTER TABLE "NewsPost" DROP COLUMN "galleryId",
DROP COLUMN "imageAlt",
DROP COLUMN "imagePath",
ADD COLUMN     "authorId" UUID,
ADD COLUMN     "authorName" VARCHAR(150),
ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "content" JSONB NOT NULL,
ADD COLUMN     "coverImage" VARCHAR(1000),
ADD COLUMN     "coverImageAlt" VARCHAR(255),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" VARCHAR(255),
ADD COLUMN     "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "NewsCategory" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsTag" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsPostTag" (
    "newsPostId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "NewsPostTag_pkey" PRIMARY KEY ("newsPostId","tagId")
);

-- CreateTable
CREATE TABLE "NewsPostMedia" (
    "id" UUID NOT NULL,
    "newsPostId" UUID NOT NULL,
    "mediaType" "NewsMediaType" NOT NULL DEFAULT 'IMAGE',
    "url" VARCHAR(1000) NOT NULL,
    "alt" VARCHAR(255),
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsPostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsCategory_name_key" ON "NewsCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NewsCategory_slug_key" ON "NewsCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTag_name_key" ON "NewsTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTag_slug_key" ON "NewsTag"("slug");

-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "NewsCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPostTag" ADD CONSTRAINT "NewsPostTag_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "NewsPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPostTag" ADD CONSTRAINT "NewsPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "NewsTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsPostMedia" ADD CONSTRAINT "NewsPostMedia_newsPostId_fkey" FOREIGN KEY ("newsPostId") REFERENCES "NewsPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
