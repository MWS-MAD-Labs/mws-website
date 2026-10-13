CREATE TABLE "PopupPromoted" (
  "id" UUID NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "posterImagePath" VARCHAR(1000),
  "posterImageAlt" VARCHAR(255),
  "buttonText" VARCHAR(100),
  "buttonUrl" VARCHAR(1000),
  "targetType" VARCHAR(50),
  "targetId" VARCHAR(255),
  "openInNewTab" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "activeFrom" TIMESTAMP(3),
  "activeUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PopupPromoted_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PopupPromoted_isActive_sortOrder_idx" ON "PopupPromoted"("isActive", "sortOrder");
CREATE INDEX "PopupPromoted_activeFrom_activeUntil_idx" ON "PopupPromoted"("activeFrom", "activeUntil");
CREATE INDEX "PopupPromoted_targetType_targetId_idx" ON "PopupPromoted"("targetType", "targetId");
