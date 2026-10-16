import { ResponseError } from "../../error/response-error";
import { GalleryRepository } from "../../repositories/gallery-repository";
import { VirtualTourRepository } from "../../repositories/virtual-tour-repository";
import {
  createVirtualTourSceneSchema,
  updateVirtualTourSceneSchema,
} from "../../validation/schemas/virtual-tour-schema";
import {
  handleVirtualTourDatabaseError,
  parseVirtualTourPayload,
  requireVirtualTourId,
} from "./virtual-tour-shared";

async function requireTour(tourId: string) {
  const tour = await VirtualTourRepository.findTourById(tourId);
  if (!tour) throw new ResponseError(404, "Virtual tour not found.");
  return tour;
}

async function requireScene(tourId: string, sceneId: string) {
  const scene = await VirtualTourRepository.findSceneById(sceneId);
  if (!scene || scene.tourId !== tourId) {
    throw new ResponseError(404, "Virtual tour scene not found.");
  }
  return scene;
}

async function requirePanoramaImage(imageId: string) {
  const image = await GalleryRepository.findImageById(imageId);
  if (!image) {
    throw new ResponseError(400, "Panorama image was not found in the Gallery library.");
  }
}

export class VirtualTourSceneService {
  static async list(tourId: string | undefined) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    await requireTour(validTourId);
    return VirtualTourRepository.listScenes(validTourId);
  }

  static async get(tourId: string | undefined, sceneId: string | undefined) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    const validSceneId = requireVirtualTourId(sceneId, "scene");
    return requireScene(validTourId, validSceneId);
  }

  static async create(tourId: string | undefined, payload: unknown) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    await requireTour(validTourId);
    const data = parseVirtualTourPayload(createVirtualTourSceneSchema, payload);
    await requirePanoramaImage(data.panoramaImageId);

    try {
      return await VirtualTourRepository.createScene(validTourId, data);
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }

  static async update(
    tourId: string | undefined,
    sceneId: string | undefined,
    payload: unknown,
  ) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    const validSceneId = requireVirtualTourId(sceneId, "scene");
    const tour = await requireTour(validTourId);
    const scene = await requireScene(validTourId, validSceneId);
    const data = parseVirtualTourPayload(updateVirtualTourSceneSchema, payload);

    if (data.panoramaImageId) {
      await requirePanoramaImage(data.panoramaImageId);
    }

    let nextStartSceneId: string | null | undefined;
    if (data.isActive === false && tour.startSceneId === scene.id) {
      const replacement = tour.scenes.find(
        (item) => item.id !== scene.id && item.isActive,
      );
      if (!replacement && tour.status === "PUBLISHED") {
        throw new ResponseError(
          400,
          "A published virtual tour must keep at least one active scene.",
        );
      }
      nextStartSceneId = replacement?.id ?? null;
    } else if (data.isActive === true && !tour.startSceneId) {
      nextStartSceneId = scene.id;
    }

    try {
      return await VirtualTourRepository.updateScene(
        validSceneId,
        data,
        nextStartSceneId,
      );
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }

  static async delete(
    tourId: string | undefined,
    sceneId: string | undefined,
  ) {
    const validTourId = requireVirtualTourId(tourId, "tour");
    const validSceneId = requireVirtualTourId(sceneId, "scene");
    const tour = await requireTour(validTourId);
    const scene = await requireScene(validTourId, validSceneId);
    const replacement = tour.scenes.find(
      (item) => item.id !== scene.id && item.isActive,
    );

    if (tour.status === "PUBLISHED" && scene.isActive && !replacement) {
      throw new ResponseError(
        400,
        "A published virtual tour must keep at least one active scene.",
      );
    }

    const nextStartSceneId =
      tour.startSceneId === scene.id ? replacement?.id ?? null : undefined;

    try {
      await VirtualTourRepository.deleteScene(
        validTourId,
        validSceneId,
        nextStartSceneId,
      );
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }
}
