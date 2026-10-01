-- CreateTable
CREATE TABLE "Faq" (
    "id" UUID NOT NULL,
    "question" VARCHAR(500) NOT NULL,
    "answer" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KindergartenFaq" (
    "academicLevelId" UUID NOT NULL,
    "faqId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KindergartenFaq_pkey" PRIMARY KEY ("academicLevelId","faqId")
);

-- CreateTable
CREATE TABLE "ElementaryFaq" (
    "academicLevelId" UUID NOT NULL,
    "faqId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ElementaryFaq_pkey" PRIMARY KEY ("academicLevelId","faqId")
);

-- CreateTable
CREATE TABLE "JuniorHighFaq" (
    "academicLevelId" UUID NOT NULL,
    "faqId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JuniorHighFaq_pkey" PRIMARY KEY ("academicLevelId","faqId")
);

-- Preserve embedded FAQ JSON before removing the old columns. A deterministic
-- UUID lets the same question/answer pair be reused across levels.
WITH source_faq AS (
    SELECT
        item.value->>'question' AS "question",
        item.value->>'answer' AS "answer"
    FROM "Kindergarten" level
    CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(level."faq") = 'array' THEN level."faq" ELSE '[]'::jsonb END
    ) WITH ORDINALITY AS item(value, ordinality)
    UNION
    SELECT
        item.value->>'question' AS "question",
        item.value->>'answer' AS "answer"
    FROM "Elementary" level
    CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(level."faq") = 'array' THEN level."faq" ELSE '[]'::jsonb END
    ) WITH ORDINALITY AS item(value, ordinality)
    UNION
    SELECT
        item.value->>'question' AS "question",
        item.value->>'answer' AS "answer"
    FROM "JuniorHigh" level
    CROSS JOIN LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(level."faq") = 'array' THEN level."faq" ELSE '[]'::jsonb END
    ) WITH ORDINALITY AS item(value, ordinality)
),
clean_faq AS (
    SELECT DISTINCT
        btrim("question") AS "question",
        btrim("answer") AS "answer"
    FROM source_faq
    WHERE btrim(COALESCE("question", '')) <> ''
      AND btrim(COALESCE("answer", '')) <> ''
)
INSERT INTO "Faq" ("id", "question", "answer", "isActive", "createdAt", "updatedAt")
SELECT
    (
        substr(md5("question" || E'\n' || "answer"), 1, 8) || '-' ||
        substr(md5("question" || E'\n' || "answer"), 9, 4) || '-' ||
        substr(md5("question" || E'\n' || "answer"), 13, 4) || '-' ||
        substr(md5("question" || E'\n' || "answer"), 17, 4) || '-' ||
        substr(md5("question" || E'\n' || "answer"), 21, 12)
    )::uuid,
    "question",
    "answer",
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM clean_faq
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "KindergartenFaq" ("academicLevelId", "faqId", "sortOrder")
SELECT
    level."id",
    (
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 1, 8) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 9, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 13, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 17, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 21, 12)
    )::uuid,
    (item.ordinality - 1)::integer
FROM "Kindergarten" level
CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(level."faq") = 'array' THEN level."faq" ELSE '[]'::jsonb END
) WITH ORDINALITY AS item(value, ordinality)
WHERE btrim(COALESCE(item.value->>'question', '')) <> ''
  AND btrim(COALESCE(item.value->>'answer', '')) <> ''
ON CONFLICT ("academicLevelId", "faqId") DO NOTHING;

INSERT INTO "ElementaryFaq" ("academicLevelId", "faqId", "sortOrder")
SELECT
    level."id",
    (
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 1, 8) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 9, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 13, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 17, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 21, 12)
    )::uuid,
    (item.ordinality - 1)::integer
FROM "Elementary" level
CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(level."faq") = 'array' THEN level."faq" ELSE '[]'::jsonb END
) WITH ORDINALITY AS item(value, ordinality)
WHERE btrim(COALESCE(item.value->>'question', '')) <> ''
  AND btrim(COALESCE(item.value->>'answer', '')) <> ''
ON CONFLICT ("academicLevelId", "faqId") DO NOTHING;

INSERT INTO "JuniorHighFaq" ("academicLevelId", "faqId", "sortOrder")
SELECT
    level."id",
    (
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 1, 8) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 9, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 13, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 17, 4) || '-' ||
        substr(md5(btrim(item.value->>'question') || E'\n' || btrim(item.value->>'answer')), 21, 12)
    )::uuid,
    (item.ordinality - 1)::integer
FROM "JuniorHigh" level
CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(level."faq") = 'array' THEN level."faq" ELSE '[]'::jsonb END
) WITH ORDINALITY AS item(value, ordinality)
WHERE btrim(COALESCE(item.value->>'question', '')) <> ''
  AND btrim(COALESCE(item.value->>'answer', '')) <> ''
ON CONFLICT ("academicLevelId", "faqId") DO NOTHING;

-- AlterTable
ALTER TABLE "Kindergarten" DROP COLUMN "faq";
ALTER TABLE "Elementary" DROP COLUMN "faq";
ALTER TABLE "JuniorHigh" DROP COLUMN "faq";

-- CreateIndex
CREATE INDEX "Faq_isActive_idx" ON "Faq"("isActive");
CREATE INDEX "KindergartenFaq_faqId_idx" ON "KindergartenFaq"("faqId");
CREATE INDEX "KindergartenFaq_academicLevelId_sortOrder_idx" ON "KindergartenFaq"("academicLevelId", "sortOrder");
CREATE INDEX "ElementaryFaq_faqId_idx" ON "ElementaryFaq"("faqId");
CREATE INDEX "ElementaryFaq_academicLevelId_sortOrder_idx" ON "ElementaryFaq"("academicLevelId", "sortOrder");
CREATE INDEX "JuniorHighFaq_faqId_idx" ON "JuniorHighFaq"("faqId");
CREATE INDEX "JuniorHighFaq_academicLevelId_sortOrder_idx" ON "JuniorHighFaq"("academicLevelId", "sortOrder");

-- AddForeignKey
ALTER TABLE "KindergartenFaq" ADD CONSTRAINT "KindergartenFaq_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "Kindergarten"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KindergartenFaq" ADD CONSTRAINT "KindergartenFaq_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "Faq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ElementaryFaq" ADD CONSTRAINT "ElementaryFaq_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "Elementary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ElementaryFaq" ADD CONSTRAINT "ElementaryFaq_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "Faq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JuniorHighFaq" ADD CONSTRAINT "JuniorHighFaq_academicLevelId_fkey" FOREIGN KEY ("academicLevelId") REFERENCES "JuniorHigh"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JuniorHighFaq" ADD CONSTRAINT "JuniorHighFaq_faqId_fkey" FOREIGN KEY ("faqId") REFERENCES "Faq"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
