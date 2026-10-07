import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { AdminPageEditorService } from "../../services/admin-page-editor-service";

async function readJson(c: Context) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class AdminAdmissionsController {
  static async get(c: Context) {
    const data = await AdminPageEditorService.getAdmissions();
    return c.json({ data: toJsonSafe(data) });
  }

  static async update(c: Context) {
    const data = await AdminPageEditorService.saveAdmissions(await readJson(c));
    return c.json({ data: toJsonSafe(data) });
  }
}

export class AdminHomeContentController {
  static async get(c: Context) {
    const data = await AdminPageEditorService.getHomeContentAdmin();
    return c.json({ data: toJsonSafe(data) });
  }

  static async updateSettings(c: Context) {
    const data = await AdminPageEditorService.saveHomeSettings(await readJson(c));
    return c.json({ data: toJsonSafe(data) });
  }

  static async createSpotlight(c: Context) {
    const data = await AdminPageEditorService.createCampusSpotlight(await readJson(c));
    return c.json({ data: toJsonSafe(data) }, 201);
  }

  static async updateSpotlight(c: Context) {
    const data = await AdminPageEditorService.updateCampusSpotlight(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(data) });
  }

  static async deleteSpotlight(c: Context) {
    await AdminPageEditorService.deleteCampusSpotlight(c.req.param("id"));
    return c.body(null, 204);
  }
}

export class AdminAdmissionGuidelinesController {
  static async get(c: Context) {
    const data = await AdminPageEditorService.getAdmissionGuidelinesAdmin();
    return c.json({ data: toJsonSafe(data) });
  }

  static async update(c: Context) {
    const data = await AdminPageEditorService.saveAdmissionGuidelines(await readJson(c));
    return c.json({ data: toJsonSafe(data) });
  }
}

export class AdminCommunityStoriesController {
  static async get(c: Context) {
    const data = await AdminPageEditorService.getCommunityStoriesAdmin();
    return c.json({ data: toJsonSafe(data) });
  }

  static async listVoices(c: Context) {
    const data = await AdminPageEditorService.listCommunityVoicesAdmin();
    return c.json({ data: toJsonSafe(data) });
  }

  static async updatePage(c: Context) {
    const data = await AdminPageEditorService.saveCommunityStoriesPage(
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(data) });
  }

  static async createNews(c: Context) {
    const data = await AdminPageEditorService.createNews(await readJson(c));
    return c.json({ data: toJsonSafe(data) }, 201);
  }

  static async updateNews(c: Context) {
    const data = await AdminPageEditorService.updateNews(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(data) });
  }

  static async deleteNews(c: Context) {
    await AdminPageEditorService.deleteNews(c.req.param("id"));
    return c.body(null, 204);
  }

  static async createVoice(c: Context) {
    const data = await AdminPageEditorService.createCommunityVoice(await readJson(c));
    return c.json({ data: toJsonSafe(data) }, 201);
  }

  static async updateVoice(c: Context) {
    const data = await AdminPageEditorService.updateCommunityVoice(
      c.req.param("id"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(data) });
  }

  static async deleteVoice(c: Context) {
    await AdminPageEditorService.deleteCommunityVoice(c.req.param("id"));
    return c.body(null, 204);
  }
}
