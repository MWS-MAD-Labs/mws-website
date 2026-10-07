import { Hono } from "hono";
import { AdminCommunityStoriesController } from "../../controllers/admin/PageEditors";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminCommunityStoriesRoute = new Hono<{
  Variables: SessionVariables;
}>();

adminCommunityStoriesRoute.use("*", requireCmsPermission("content:manage"));
adminCommunityStoriesRoute.get("/", AdminCommunityStoriesController.get);
adminCommunityStoriesRoute.put("/page", AdminCommunityStoriesController.updatePage);
adminCommunityStoriesRoute.post("/news", AdminCommunityStoriesController.createNews);
adminCommunityStoriesRoute.patch(
  "/news/:id",
  AdminCommunityStoriesController.updateNews,
);
adminCommunityStoriesRoute.put(
  "/news/:id",
  AdminCommunityStoriesController.updateNews,
);
adminCommunityStoriesRoute.delete(
  "/news/:id",
  AdminCommunityStoriesController.deleteNews,
);
adminCommunityStoriesRoute.get("/voices", AdminCommunityStoriesController.listVoices);
adminCommunityStoriesRoute.post("/voices", AdminCommunityStoriesController.createVoice);
adminCommunityStoriesRoute.patch(
  "/voices/:id",
  AdminCommunityStoriesController.updateVoice,
);
adminCommunityStoriesRoute.put(
  "/voices/:id",
  AdminCommunityStoriesController.updateVoice,
);
adminCommunityStoriesRoute.delete(
  "/voices/:id",
  AdminCommunityStoriesController.deleteVoice,
);
