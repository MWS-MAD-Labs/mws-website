CREATE TABLE IF NOT EXISTS "hero_slides" (
  "id" UUID PRIMARY KEY,
  "image" TEXT NOT NULL,
  "alt" VARCHAR(255) NOT NULL,
  "headline" VARCHAR(180),
  "caption" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMPTZ(6)
);

CREATE INDEX IF NOT EXISTS "idx_hero_slides_sort_order"
  ON "hero_slides"("sort_order");
