ALTER TABLE "CommunityVoice"
ADD COLUMN "showOnHome" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "homeSortOrder" INTEGER NOT NULL DEFAULT 0;

WITH ranked AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (ORDER BY "sortOrder" ASC, "createdAt" ASC) - 1 AS "homeOrder"
  FROM "CommunityVoice"
  WHERE "isActive" = true
)
UPDATE "CommunityVoice"
SET
  "showOnHome" = true,
  "homeSortOrder" = ranked."homeOrder"
FROM ranked
WHERE "CommunityVoice"."id" = ranked."id"
  AND ranked."homeOrder" < 5;
