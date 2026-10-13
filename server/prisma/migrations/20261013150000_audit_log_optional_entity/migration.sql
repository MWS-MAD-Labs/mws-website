-- Page-level actions (Contact page, Home info section, login failures) have no
-- single record id, so audit entries may leave entityId empty.
ALTER TABLE "AuditLog" ALTER COLUMN "entityId" DROP NOT NULL;
