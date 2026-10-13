-- Sessions ended by logout, so a copied cookie stops working after restarts too.
CREATE TABLE "CmsRevokedSession" (
  "jti" VARCHAR(64) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CmsRevokedSession_pkey" PRIMARY KEY ("jti")
);

CREATE INDEX "CmsRevokedSession_expiresAt_idx" ON "CmsRevokedSession"("expiresAt");
