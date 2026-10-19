import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { VirtualTourLinkService } from "../../services/virtual-tour/virtual-tour-link";
import { VirtualTourSceneService } from "../../services/virtual-tour/virtual-tour-scene";
import { VirtualTourService } from "../../services/virtual-tour/virtual-tour";
import type { SessionVariables } from "../../types/hono-context";

type AdminContext = Context<{ Variables: SessionVariables }>;

async function readJson(c: AdminContext) {
  try {
    return await c.req.json();
  } catch {
    throw new ResponseError(400, "Invalid JSON body.");
  }
}

export class VirtualTourController {
  static async list(c: AdminContext) {
    return c.json({ data: toJsonSafe(await VirtualTourService.listAdmin()) });
  }

  static async get(c: AdminContext) {
    return c.json({
      data: toJsonSafe(await VirtualTourService.get(c.req.param("tourId"))),
    });
  }

  static async create(c: AdminContext) {
    const tour = await VirtualTourService.create(await readJson(c));
    return c.json({ data: toJsonSafe(tour) }, 201);
  }

  static async update(c: AdminContext) {
    const tour = await VirtualTourService.update(
      c.req.param("tourId"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(tour) });
  }

  static async delete(c: AdminContext) {
    await VirtualTourService.delete(c.req.param("tourId"));
    return c.body(null, 204);
  }
}

export class VirtualTourSceneController {
  static async list(c: AdminContext) {
    const scenes = await VirtualTourSceneService.list(c.req.param("tourId"));
    return c.json({ data: toJsonSafe(scenes) });
  }

  static async get(c: AdminContext) {
    const scene = await VirtualTourSceneService.get(
      c.req.param("tourId"),
      c.req.param("sceneId"),
    );
    return c.json({ data: toJsonSafe(scene) });
  }

  static async create(c: AdminContext) {
    const scene = await VirtualTourSceneService.create(
      c.req.param("tourId"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(scene) }, 201);
  }

  static async update(c: AdminContext) {
    const scene = await VirtualTourSceneService.update(
      c.req.param("tourId"),
      c.req.param("sceneId"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(scene) });
  }

  static async delete(c: AdminContext) {
    await VirtualTourSceneService.delete(
      c.req.param("tourId"),
      c.req.param("sceneId"),
    );
    return c.body(null, 204);
  }
}

export class VirtualTourLinkController {
  static async list(c: AdminContext) {
    const links = await VirtualTourLinkService.list(
      c.req.param("tourId"),
      c.req.param("sceneId"),
    );
    return c.json({ data: toJsonSafe(links) });
  }

  static async create(c: AdminContext) {
    const link = await VirtualTourLinkService.create(
      c.req.param("tourId"),
      c.req.param("sceneId"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(link) }, 201);
  }

  static async update(c: AdminContext) {
    const link = await VirtualTourLinkService.update(
      c.req.param("tourId"),
      c.req.param("sceneId"),
      c.req.param("linkId"),
      await readJson(c),
    );
    return c.json({ data: toJsonSafe(link) });
  }

  static async delete(c: AdminContext) {
    await VirtualTourLinkService.delete(
      c.req.param("tourId"),
      c.req.param("sceneId"),
      c.req.param("linkId"),
    );
    return c.body(null, 204);
  }
}
