import { Hono } from "hono";
import { AdminAcademicCrudController } from "../../controllers/admin/AcademicCrud";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type {
  AcademicCrudResource,
  FixedAcademicCrudResource,
} from "../../services/academic-crud-service";
import type { SessionVariables } from "../../types/hono-context";

export const adminAcademicCrudRoute = new Hono<{
  Variables: SessionVariables;
}>();

function mountResource(path: string, resource: AcademicCrudResource) {
  adminAcademicCrudRoute.get(
    path,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.list(resource),
  );
  adminAcademicCrudRoute.post(
    path,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.create(resource),
  );
  adminAcademicCrudRoute.get(
    `${path}/:id`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.detail(resource),
  );
  adminAcademicCrudRoute.patch(
    `${path}/:id`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.update(resource),
  );
  adminAcademicCrudRoute.put(
    `${path}/:id`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.update(resource),
  );
  adminAcademicCrudRoute.delete(
    `${path}/:id`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.delete(resource),
  );
}

mountResource("/academics", "academics");
mountResource("/academic-levels", "academic-levels");
mountResource("/faqs", "faqs");
mountResource("/kindergartens", "kindergartens");
mountResource("/elementaries", "elementaries");
mountResource("/junior-highs", "junior-highs");

function mountLevelFaq(path: string, resource: FixedAcademicCrudResource) {
  adminAcademicCrudRoute.post(
    `${path}/:id/faqs`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.attachFaq(resource),
  );
  adminAcademicCrudRoute.patch(
    `${path}/:id/faqs`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.reorderFaqs(resource),
  );
  adminAcademicCrudRoute.put(
    `${path}/:id/faqs`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.reorderFaqs(resource),
  );
  adminAcademicCrudRoute.delete(
    `${path}/:id/faqs/:faqId`,
    requireCmsPermission("content:manage"),
    AdminAcademicCrudController.detachFaq(resource),
  );
}

mountLevelFaq("/kindergartens", "kindergartens");
mountLevelFaq("/elementaries", "elementaries");
mountLevelFaq("/junior-highs", "junior-highs");
