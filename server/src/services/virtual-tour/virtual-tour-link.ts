import { ResponseError } from "../../error/response-error";
import { VirtualTourRepository } from "../../repositories/virtual-tour-repository";
import {
  createVirtualTourLinkSchema,
  updateVirtualTourLinkSchema,
} from "../../validation/schemas/virtual-tour-schema";
import {
  handleVirtualTourDatabaseError,
  parseVirtualTourPayload,
  requireVirtualTourId,
} from "./virtual-tour-shared";

async function requireSceneInTour(tourId: string, sceneId: string) {
  const scene = await VirtualTourRepository.findSceneById(sceneId);
  if (!scene || scene.tourId !== tourId) {
    throw new ResponseError(404, "Virtual tour scene not found.");
  }
  return scene;
}

async function requireLink(fromSceneId: string, linkId: string) {
  const link = await VirtualTourRepository.findLinkById(linkId);
  if (!link || link.fromSceneId !== fromSceneId) {
    throw new ResponseError(404, "Virtual tour link not found.");
  }
  return link;
}

async function validateTargetScene(
  tourId: string,
  fromSceneId: string,
  toSceneId: string,
) {
  if (fromSceneId === toSceneId) {
    throw new ResponseError(400, "A scene cannot link to itself.");
  }
  const target = await VirtualTourRepository.findSceneById(toSceneId);
  if (!target || target.tourId !== tourId) {
    throw new ResponseError(
      400,
      "Target scene must belong to the same virtual tour.",
    );
  }
}

export class VirtualTourLinkService {
  static async list(
    tourId: string | undefined,
    sceneId: string | undefined,
  ) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    const validSceneId = requireVirtualTourId(sceneId, "scene");
    await requireSceneInTour(validTourId, validSceneId);
    return VirtualTourRepository.listLinks(validSceneId);
  }

  static async create(
    tourId: string | undefined,
    sceneId: string | undefined,
    payload: unknown,
  ) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    const validSceneId = requireVirtualTourId(sceneId, "scene");
    await requireSceneInTour(validTourId, validSceneId);
    const data = parseVirtualTourPayload(createVirtualTourLinkSchema, payload);
    await validateTargetScene(validTourId, validSceneId, data.toSceneId);

    try {
      return await VirtualTourRepository.createLink(validSceneId, data);
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }

  static async update(
    tourId: string | undefined,
    sceneId: string | undefined,
    linkId: string | undefined,
    payload: unknown,
  ) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    const validSceneId = requireVirtualTourId(sceneId, "scene");
    const validLinkId = requireVirtualTourId(linkId, "link");
    await requireSceneInTour(validTourId, validSceneId);
    const link = await requireLink(validSceneId, validLinkId);
    const data = parseVirtualTourPayload(updateVirtualTourLinkSchema, payload);

    if (data.toSceneId) {
      await validateTargetScene(validTourId, validSceneId, data.toSceneId);
    } else if (link.toScene.tourId !== validTourId) {
      throw new ResponseError(
        400,
        "Target scene must belong to the same virtual tour.",
      );
    }

    try {
      return await VirtualTourRepository.updateLink(validLinkId, data);
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }

  static async delete(
    tourId: string | undefined,
    sceneId: string | undefined,
    linkId: string | undefined,
  ) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    const validSceneId = requireVirtualTourId(sceneId, "scene");
    const validLinkId = requireVirtualTourId(linkId, "link");
    await requireSceneInTour(validTourId, validSceneId);
    await requireLink(validSceneId, validLinkId);

    try {
      await VirtualTourRepository.deleteLink(validLinkId);
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }
}
