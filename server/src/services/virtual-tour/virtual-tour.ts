import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { ResponseError } from "../../error/response-error";
import {
  VirtualTourRepository,
  type VirtualTourDetail,
} from "../../repositories/virtual-tour-repository";
import {
  createVirtualTourSchema,
  updateVirtualTourSchema,
} from "../../validation/schemas/virtual-tour-schema";
import {
  handleVirtualTourDatabaseError,
  parseVirtualTourPayload,
  requireVirtualTourId,
} from "./virtual-tour-shared";

function publicPanoramaPath(image: { id: string; path: string }) {
  if (image.path.startsWith("/") || image.path.startsWith("http")) {
    return image.path;
  }
  return `/api/gallery-images/${image.id}/file`;
}

function publicTourResponse(tour: VirtualTourDetail) {
  const activeScenes = tour.scenes.filter((scene) => scene.isActive);
  const activeSceneIds = new Set(activeScenes.map((scene) => scene.id));
  const startSceneId = activeSceneIds.has(tour.startSceneId ?? "")
    ? tour.startSceneId
    : activeScenes[0]?.id ?? null;

  return {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    startNodeId: startSceneId,
    nodes: activeScenes.map((scene) => ({
      id: scene.id,
      name: scene.name,
      caption: scene.name,
      description: scene.description ?? undefined,
      panorama: publicPanoramaPath(scene.panoramaImage),
      thumbnail: publicPanoramaPath(scene.panoramaImage),
      data: {
        slug: scene.slug,
        initialPosition: {
          yaw: `${scene.initialYaw}deg`,
          pitch: `${scene.initialPitch}deg`,
        },
      },
      links: scene.outgoingLinks
        .filter((link) => activeSceneIds.has(link.toSceneId))
        .map((link) => ({
          nodeId: link.toSceneId,
          position: {
            yaw: `${link.yaw}deg`,
            pitch: `${link.pitch}deg`,
          },
          ...(link.label ? { data: { label: link.label } } : {}),
        })),
    })),
    publishedAt: tour.publishedAt,
    updatedAt: tour.updatedAt,
  };
}

export class VirtualTourService {
  static async listAdmin() {
    return VirtualTourRepository.listAdmin();
  }

  static async listPublic() {
    const tours = await VirtualTourRepository.listPublished();
    return tours
      .filter((tour) => tour._count.scenes > 0)
      .map((tour) => ({
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        description: tour.description,
        startSceneId: tour.startScene?.isActive ? tour.startSceneId : null,
        sceneCount: tour._count.scenes,
        publishedAt: tour.publishedAt,
        updatedAt: tour.updatedAt,
      }));
  }

  static async get(id: string | undefined) {
    const tourId = requireVirtualTourId(id, "tour");
    const tour = await VirtualTourRepository.findTourById(tourId);
    if (!tour) throw new ResponseError(404, "Virtual tour not found.");
    return tour;
  }

  static async getPublic(slug: string | undefined) {
    const parsed = z
      .string()
      .trim()
      .min(1)
      .max(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .safeParse(slug);
    if (!parsed.success) throw new ResponseError(404, "Virtual tour not found.");

    const tour = await VirtualTourRepository.findPublishedTourBySlug(parsed.data);
    if (!tour) throw new ResponseError(404, "Virtual tour not found.");

    const response = publicTourResponse(tour);
    if (!response.startNodeId || response.nodes.length === 0) {
      throw new ResponseError(404, "Virtual tour has no published scenes.");
    }
    return response;
  }

  static async create(payload: unknown) {
    const data = parseVirtualTourPayload(createVirtualTourSchema, payload);
    if (data.status !== "DRAFT" || data.startSceneId) {
      throw new ResponseError(
        400,
        "Create the virtual tour as a draft, then add scenes before publishing.",
      );
    }

    try {
      const created = await VirtualTourRepository.createTour(data);
      return await this.get(created.id);
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }

  static async update(id: string | undefined, payload: unknown) {
    const tourId = requireVirtualTourId(id, "tour");
    const existing = await this.get(tourId);
    const data = parseVirtualTourPayload(updateVirtualTourSchema, payload);
    const activeScenes = existing.scenes.filter((scene) => scene.isActive);

    if (data.startSceneId) {
      const startScene = existing.scenes.find(
        (scene) => scene.id === data.startSceneId,
      );
      if (!startScene) {
        throw new ResponseError(400, "Start scene must belong to this virtual tour.");
      }
      if (!startScene.isActive) {
        throw new ResponseError(400, "Start scene must be active.");
      }
    }

    const nextStatus = data.status ?? existing.status;
    const updateData: Prisma.VirtualTourUncheckedUpdateInput = { ...data };

    if (nextStatus === "PUBLISHED") {
      if (activeScenes.length === 0) {
        throw new ResponseError(
          400,
          "A virtual tour needs at least one active scene before publishing.",
        );
      }

      const requestedStartId = data.startSceneId ?? existing.startSceneId;
      const validStart = activeScenes.find(
        (scene) => scene.id === requestedStartId,
      );
      updateData.startSceneId = validStart?.id ?? activeScenes[0]!.id;
      if (existing.status !== "PUBLISHED") updateData.publishedAt = new Date();
    } else if (nextStatus === "DRAFT") {
      updateData.publishedAt = null;
    }

    try {
      return await VirtualTourRepository.updateTour(tourId, updateData);
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }

  static async delete(id: string | undefined) {
    const tourId = requireVirtualTourId(id, "tour");
    await this.get(tourId);

    try {
      await VirtualTourRepository.deleteTour(tourId);
    } catch (error) {
      handleVirtualTourDatabaseError(error);
    }
  }
}
