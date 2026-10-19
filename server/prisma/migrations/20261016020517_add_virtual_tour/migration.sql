-- CreateEnum
CREATE TYPE "VirtualTourStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "VirtualTour" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "VirtualTourStatus" NOT NULL DEFAULT 'DRAFT',
    "startSceneId" UUID,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualTour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualTourScene" (
    "id" UUID NOT NULL,
    "tourId" UUID NOT NULL,
    "panoramaImageId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "initialYaw" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "initialPitch" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualTourScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VirtualTourLink" (
    "id" UUID NOT NULL,
    "fromSceneId" UUID NOT NULL,
    "toSceneId" UUID NOT NULL,
    "label" VARCHAR(255),
    "yaw" DOUBLE PRECISION NOT NULL,
    "pitch" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualTourLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VirtualTour_slug_key" ON "VirtualTour"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualTour_startSceneId_key" ON "VirtualTour"("startSceneId");

-- CreateIndex
CREATE INDEX "VirtualTourScene_tourId_sortOrder_idx" ON "VirtualTourScene"("tourId", "sortOrder");

-- CreateIndex
CREATE INDEX "VirtualTourScene_panoramaImageId_idx" ON "VirtualTourScene"("panoramaImageId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualTourScene_tourId_slug_key" ON "VirtualTourScene"("tourId", "slug");

-- CreateIndex
CREATE INDEX "VirtualTourLink_fromSceneId_sortOrder_idx" ON "VirtualTourLink"("fromSceneId", "sortOrder");

-- CreateIndex
CREATE INDEX "VirtualTourLink_toSceneId_idx" ON "VirtualTourLink"("toSceneId");

-- CreateIndex
CREATE UNIQUE INDEX "VirtualTourLink_fromSceneId_toSceneId_key" ON "VirtualTourLink"("fromSceneId", "toSceneId");

-- AddForeignKey
ALTER TABLE "VirtualTour" ADD CONSTRAINT "VirtualTour_startSceneId_fkey" FOREIGN KEY ("startSceneId") REFERENCES "VirtualTourScene"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualTourScene" ADD CONSTRAINT "VirtualTourScene_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "VirtualTour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualTourScene" ADD CONSTRAINT "VirtualTourScene_panoramaImageId_fkey" FOREIGN KEY ("panoramaImageId") REFERENCES "GalleryImage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualTourLink" ADD CONSTRAINT "VirtualTourLink_fromSceneId_fkey" FOREIGN KEY ("fromSceneId") REFERENCES "VirtualTourScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VirtualTourLink" ADD CONSTRAINT "VirtualTourLink_toSceneId_fkey" FOREIGN KEY ("toSceneId") REFERENCES "VirtualTourScene"("id") ON DELETE CASCADE ON UPDATE CASCADE;
