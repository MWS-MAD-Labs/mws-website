-- CreateTable
CREATE TABLE "Partner" (
    "id" UUID NOT NULL,
    "name" VARCHAR(225) NOT NULL,
    "description" VARCHAR(225) NOT NULL,
    "logo" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);
