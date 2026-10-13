-- Mark one canonical row per fixed academic level and prevent future duplicates.
-- Existing duplicate rows are left untouched with NULL levelKey so no content is
-- deleted during deploy; the services read only the canonical row.

ALTER TABLE "Kindergarten" ADD COLUMN "levelKey" VARCHAR(40);
ALTER TABLE "Elementary" ADD COLUMN "levelKey" VARCHAR(40);
ALTER TABLE "JuniorHigh" ADD COLUMN "levelKey" VARCHAR(40);

WITH ranked AS (
  SELECT "id", row_number() OVER (ORDER BY "updatedAt" DESC, "createdAt" DESC) AS rn
  FROM "Kindergarten"
)
UPDATE "Kindergarten"
SET "levelKey" = 'kindergarten'
FROM ranked
WHERE "Kindergarten"."id" = ranked."id" AND ranked.rn = 1;

WITH ranked AS (
  SELECT "id", row_number() OVER (ORDER BY "updatedAt" DESC, "createdAt" DESC) AS rn
  FROM "Elementary"
)
UPDATE "Elementary"
SET "levelKey" = 'elementary'
FROM ranked
WHERE "Elementary"."id" = ranked."id" AND ranked.rn = 1;

WITH ranked AS (
  SELECT "id", row_number() OVER (ORDER BY "updatedAt" DESC, "createdAt" DESC) AS rn
  FROM "JuniorHigh"
)
UPDATE "JuniorHigh"
SET "levelKey" = 'high-school'
FROM ranked
WHERE "JuniorHigh"."id" = ranked."id" AND ranked.rn = 1;

ALTER TABLE "Kindergarten" ALTER COLUMN "levelKey" SET DEFAULT 'kindergarten';
ALTER TABLE "Elementary" ALTER COLUMN "levelKey" SET DEFAULT 'elementary';
ALTER TABLE "JuniorHigh" ALTER COLUMN "levelKey" SET DEFAULT 'high-school';

CREATE UNIQUE INDEX "Kindergarten_levelKey_key" ON "Kindergarten"("levelKey");
CREATE UNIQUE INDEX "Elementary_levelKey_key" ON "Elementary"("levelKey");
CREATE UNIQUE INDEX "JuniorHigh_levelKey_key" ON "JuniorHigh"("levelKey");
