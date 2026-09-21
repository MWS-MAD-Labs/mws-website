import { Hono } from "hono";
import { NewsController } from "../../controllers/admin/newsControllers";
import { requireCmsPermission } from "../../middleware/require-cms-permission";
import type { SessionVariables } from "../../types/hono-context";

export const adminNewsRoute = new Hono<{ Variables: SessionVariables }>();

// Session + admin auth already run in routes/admin/index.ts.
adminNewsRoute.use("*", requireCmsPermission("content:manage"));

// ---------- Categories ----------
adminNewsRoute.get("/categories", NewsController.listCategories);
adminNewsRoute.post("/categories", NewsController.createCategory);
adminNewsRoute.get("/categories/:id", NewsController.detailCategory);
adminNewsRoute.patch("/categories/:id", NewsController.updateCategory);
adminNewsRoute.put("/categories/:id", NewsController.updateCategory);
adminNewsRoute.delete("/categories/:id", NewsController.deleteCategory);

// ---------- Tags ----------
adminNewsRoute.get("/tags", NewsController.listTags);
adminNewsRoute.post("/tags", NewsController.createTag);
adminNewsRoute.get("/tags/:id", NewsController.detailTag);
adminNewsRoute.patch("/tags/:id", NewsController.updateTag);
adminNewsRoute.put("/tags/:id", NewsController.updateTag);
adminNewsRoute.delete("/tags/:id", NewsController.deleteTag);

// ---------- Posts ----------
adminNewsRoute.get("/posts", NewsController.listPosts);
adminNewsRoute.post("/posts", NewsController.createPost);
adminNewsRoute.get("/posts/:id", NewsController.detailPost);
adminNewsRoute.patch("/posts/:id", NewsController.updatePost);
adminNewsRoute.put("/posts/:id", NewsController.updatePost);
adminNewsRoute.delete("/posts/:id", NewsController.deletePost);

// ---------- Post media (always nested under its post) ----------
adminNewsRoute.get("/posts/:id/media", NewsController.listMedia);
adminNewsRoute.post("/posts/:id/media", NewsController.createMedia);
adminNewsRoute.get("/posts/:id/media/:mediaId", NewsController.detailMedia);
adminNewsRoute.patch("/posts/:id/media/:mediaId", NewsController.updateMedia);
adminNewsRoute.put("/posts/:id/media/:mediaId", NewsController.updateMedia);
adminNewsRoute.delete("/posts/:id/media/:mediaId", NewsController.deleteMedia);
