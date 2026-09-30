-- CreateTable
CREATE TABLE "PageView" (
    "id" UUID NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "referrerHost" VARCHAR(255),
    "sessionId" VARCHAR(64) NOT NULL,
    "deviceType" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_path_createdAt_idx" ON "PageView"("path", "createdAt");
