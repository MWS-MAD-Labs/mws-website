-- AlterTable
ALTER TABLE "OurSchool" ADD COLUMN     "featuredImageId" UUID;

-- AddForeignKey
ALTER TABLE "OurSchool" ADD CONSTRAINT "OurSchool_featuredImageId_fkey" FOREIGN KEY ("featuredImageId") REFERENCES "GalleryImage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
