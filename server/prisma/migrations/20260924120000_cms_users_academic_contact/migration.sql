ALTER TABLE "CmsUser"
  ADD COLUMN "email" VARCHAR(255),
  ADD COLUMN "lastCentralSyncedAt" TIMESTAMP(3),
  ADD COLUMN "deactivatedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "CmsUser_email_key" ON "CmsUser"("email");

CREATE TABLE "CmsUserInvitation" (
  "id" UUID NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "centralUserId" TEXT,
  "name" VARCHAR(255),
  "unitId" TEXT,
  "cmsRoleId" UUID NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  "invitedById" UUID,
  "acceptedUserId" UUID,
  "expiresAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CmsUserInvitation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CmsUserInvitation_email_idx" ON "CmsUserInvitation"("email");
CREATE INDEX "CmsUserInvitation_centralUserId_idx" ON "CmsUserInvitation"("centralUserId");
CREATE INDEX "CmsUserInvitation_status_idx" ON "CmsUserInvitation"("status");

ALTER TABLE "CmsUserInvitation"
  ADD CONSTRAINT "CmsUserInvitation_cmsRoleId_fkey"
  FOREIGN KEY ("cmsRoleId") REFERENCES "CmsRole"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CmsUserInvitation"
  ADD CONSTRAINT "CmsUserInvitation_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "CmsUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CmsUserInvitation"
  ADD CONSTRAINT "CmsUserInvitation_acceptedUserId_fkey"
  FOREIGN KEY ("acceptedUserId") REFERENCES "CmsUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AcademicLevelPage" (
  "id" UUID NOT NULL,
  "programId" UUID NOT NULL,
  "levelKey" VARCHAR(50) NOT NULL,
  "hero" JSONB NOT NULL,
  "overview" JSONB NOT NULL,
  "sections" JSONB NOT NULL,
  "faq" JSONB,
  "galleryId" UUID,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AcademicLevelPage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AcademicLevelPage_programId_key" ON "AcademicLevelPage"("programId");
CREATE UNIQUE INDEX "AcademicLevelPage_levelKey_key" ON "AcademicLevelPage"("levelKey");

ALTER TABLE "AcademicLevelPage"
  ADD CONSTRAINT "AcademicLevelPage_programId_fkey"
  FOREIGN KEY ("programId") REFERENCES "Program"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AcademicLevelPage"
  ADD CONSTRAINT "AcademicLevelPage_galleryId_fkey"
  FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ContactInquiry" (
  "id" UUID NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "subject" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100),
  "message" TEXT NOT NULL,
  "status" VARCHAR(30) NOT NULL DEFAULT 'NEW',
  "source" VARCHAR(100),
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContactInquiry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactInquiry_status_idx" ON "ContactInquiry"("status");
CREATE INDEX "ContactInquiry_createdAt_idx" ON "ContactInquiry"("createdAt");
