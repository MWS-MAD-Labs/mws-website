-- CreateEnum
CREATE TYPE "AcademicCalendarEventType" AS ENUM ('EVENT', 'HOLIDAY');

-- CreateTable
CREATE TABLE "AcademicCalendarEvent" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" "AcademicCalendarEventType" NOT NULL DEFAULT 'EVENT',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "eventTime" VARCHAR(100),
    "location" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AcademicCalendarEvent_isActive_startDate_idx" ON "AcademicCalendarEvent"("isActive", "startDate");
CREATE INDEX "AcademicCalendarEvent_type_startDate_idx" ON "AcademicCalendarEvent"("type", "startDate");
