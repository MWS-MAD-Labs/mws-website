DO $$
BEGIN
  CREATE TYPE "CmsRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'VIEWER');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE IF EXISTS "users"
  ADD COLUMN IF NOT EXISTS "cms_role" "CmsRole";

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL
     AND to_regclass('public.roles') IS NOT NULL THEN
    UPDATE "users"
    SET "cms_role" = CASE "roles"."name"
      WHEN 'ADMIN' THEN 'ADMIN'::"CmsRole"
      WHEN 'VIEWER' THEN 'VIEWER'::"CmsRole"
      ELSE "users"."cms_role"
    END
    FROM "roles"
    WHERE "users"."role_id" = "roles"."id"
      AND "users"."cms_role" IS NULL
      AND "roles"."deleted_at" IS NULL
      AND "roles"."name" IN ('ADMIN', 'VIEWER');
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS "idx_users_cms_role" ON "users"("cms_role");
  END IF;
END $$;
