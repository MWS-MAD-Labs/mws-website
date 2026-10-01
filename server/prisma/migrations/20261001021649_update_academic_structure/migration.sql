/*
  Warnings:

  - You are about to drop the column `academicId` on the `Elementary` table. All the data in the column will be lost.
  - You are about to drop the column `academicId` on the `JuniorHigh` table. All the data in the column will be lost.
  - You are about to drop the column `academicId` on the `Kindergarten` table. All the data in the column will be lost.
  - You are about to drop the `AcademicLevelPage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `academicLevelId` to the `Elementary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hero` to the `Elementary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overview` to the `Elementary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sections` to the `Elementary` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicLevelId` to the `JuniorHigh` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hero` to the `JuniorHigh` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overview` to the `JuniorHigh` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sections` to the `JuniorHigh` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academicLevelId` to the `Kindergarten` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hero` to the `Kindergarten` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overview` to the `Kindergarten` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sections` to the `Kindergarten` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AcademicLevelPage" DROP CONSTRAINT "AcademicLevelPage_galleryId_fkey";

-- DropForeignKey
ALTER TABLE "AcademicLevelPage" DROP CONSTRAINT "AcademicLevelPage_programId_fkey";

-- DropForeignKey
ALTER TABLE "Elementary" DROP CONSTRAINT "Elementary_academicId_fkey";

-- DropForeignKey
ALTER TABLE "JuniorHigh" DROP CONSTRAINT "JuniorHigh_academicId_fkey";

-- DropForeignKey
ALTER TABLE "Kindergarten" DROP CONSTRAINT "Kindergarten_academicId_fkey";

-- AlterTable
ALTER TABLE "Academic" ADD COLUMN     "coverImage" VARCHAR(1000);

-- AlterTable
ALTER TABLE "Elementary" DROP COLUMN "academicId",
ADD COLUMN     "academicLevelId" UUID NOT NULL,
ADD COLUMN     "coverImage" VARCHAR(1000),
ADD COLUMN     "faq" JSONB,
ADD COLUMN     "hero" JSONB NOT NULL,
ADD COLUMN     "overview" JSONB NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "sections" JSONB NOT NULL,
ADD COLUMN     "status" VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "JuniorHigh" DROP COLUMN "academicId",
ADD COLUMN     "academicLevelId" UUID NOT NULL,
ADD COLUMN     "coverImage" VARCHAR(1000),
ADD COLUMN     "faq" JSONB,
ADD COLUMN     "hero" JSONB NOT NULL,
ADD COLUMN     "overview" JSONB NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "sections" JSONB NOT NULL,
ADD COLUMN     "status" VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "Kindergarten" DROP COLUMN "academicId",
ADD COLUMN     "academicLevelId" UUID NOT NULL,
ADD COLUMN     "coverImage" VARCHAR(1000),
ADD COLUMN     "faq" JSONB,
ADD COLUMN     "hero" JSONB NOT NULL,
ADD COLUMN     "overview" JSONB NOT NULL,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "sections" JSONB NOT NULL,
ADD COLUMN     "status" VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED';

-- DropTable
DROP TABLE "AcademicLevelPage";

-- CreateTable
CREATE TABLE "AcademicLevel" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicLevel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Kindergarten" ADD CONSTRAINT "Kindergarten_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Elementary" ADD CONSTRAINT "Elementary_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuniorHigh" ADD CONSTRAINT "JuniorHigh_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "AcademicLevel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
