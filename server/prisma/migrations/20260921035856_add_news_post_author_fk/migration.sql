-- AddForeignKey
ALTER TABLE "NewsPost" ADD CONSTRAINT "NewsPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "CmsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
