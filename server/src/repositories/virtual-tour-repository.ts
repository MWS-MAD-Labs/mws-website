import type { Prisma } from "@prisma/client";
import { getPrisma } from "../lib/prisma";
import type {
  CreateVirtualTourInput,
  CreateVirtualTourLinkInput,
  CreateVirtualTourSceneInput,
  UpdateVirtualTourLinkInput,
  UpdateVirtualTourSceneInput,
} from "../validation/schemas/virtual-tour-schema";

const sceneOrder = [
  { sortOrder: "asc" as const },
  { createdAt: "asc" as const },
];

const linkOrder = [
  { sortOrder: "asc" as const },
  { createdAt: "asc" as const },
];

const panoramaImageSelect = {
  id: true,
  path: true,
  title: true,
  caption: true,
};

const targetSceneSelect = {
  id: true,
  tourId: true,
  name: true,
  slug: true,
  isActive: true,
};

const tourDetailInclude = {
  startScene: {
    select: targetSceneSelect,
  },
  scenes: {
    orderBy: sceneOrder,
    include: {
      panoramaImage: { select: panoramaImageSelect },
      outgoingLinks: {
        orderBy: linkOrder,
        include: {
          toScene: { select: targetSceneSelect },
        },
      },
    },
  },
} satisfies Prisma.VirtualTourInclude;

const sceneDetailInclude = {
  panoramaImage: { select: panoramaImageSelect },
  outgoingLinks: {
    orderBy: linkOrder,
    include: {
      toScene: { select: targetSceneSelect },
    },
  },
} satisfies Prisma.VirtualTourSceneInclude;

const linkDetailInclude = {
  fromScene: { select: targetSceneSelect },
  toScene: { select: targetSceneSelect },
} satisfies Prisma.VirtualTourLinkInclude;

export type VirtualTourDetail = Prisma.VirtualTourGetPayload<{
  include: typeof tourDetailInclude;
}>;

export class VirtualTourRepository {
  static async listAdmin() {
    return getPrisma().virtualTour.findMany({
      include: {
        startScene: { select: targetSceneSelect },
        _count: { select: { scenes: true } },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
  }

  static async listPublished() {
    return getPrisma().virtualTour.findMany({
      where: { status: "PUBLISHED" },
      include: {
        startScene: { select: targetSceneSelect },
        _count: {
          select: { scenes: { where: { isActive: true } } },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
    });
  }

  static async findTourById(id: string) {
    return getPrisma().virtualTour.findUnique({
      where: { id },
      include: tourDetailInclude,
    });
  }

  static async findPublishedTourBySlug(slug: string) {
    return getPrisma().virtualTour.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: tourDetailInclude,
    });
  }

  static async createTour(data: CreateVirtualTourInput) {
    return getPrisma().virtualTour.create({ data });
  }

  static async updateTour(
    id: string,
    data: Prisma.VirtualTourUncheckedUpdateInput,
  ) {
    return getPrisma().virtualTour.update({
      where: { id },
      data,
      include: tourDetailInclude,
    });
  }

  static async deleteTour(id: string) {
    return getPrisma().virtualTour.delete({ where: { id } });
  }

  static async findSceneById(id: string) {
    return getPrisma().virtualTourScene.findUnique({
      where: { id },
      include: sceneDetailInclude,
    });
  }

  static async listScenes(tourId: string) {
    return getPrisma().virtualTourScene.findMany({
      where: { tourId },
      include: sceneDetailInclude,
      orderBy: sceneOrder,
    });
  }

  static async createScene(
    tourId: string,
    data: CreateVirtualTourSceneInput,
  ) {
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      const scene = await tx.virtualTourScene.create({
        data: { ...data, tourId },
        include: sceneDetailInclude,
      });
      const tour = await tx.virtualTour.findUnique({
        where: { id: tourId },
        select: { startSceneId: true },
      });

      if (!tour?.startSceneId && scene.isActive) {
        await tx.virtualTour.update({
          where: { id: tourId },
          data: { startSceneId: scene.id },
        });
      }

      return scene;
    });
  }

  static async updateScene(
    id: string,
    data: UpdateVirtualTourSceneInput,
    nextStartSceneId?: string | null,
  ) {
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      const scene = await tx.virtualTourScene.update({
        where: { id },
        data,
        include: sceneDetailInclude,
      });

      if (nextStartSceneId !== undefined) {
        await tx.virtualTour.update({
          where: { id: scene.tourId },
          data: { startSceneId: nextStartSceneId },
        });
      }

      return scene;
    });
  }

  static async deleteScene(
    tourId: string,
    sceneId: string,
    nextStartSceneId?: string | null,
  ) {
    const prisma = getPrisma();

    return prisma.$transaction(async (tx) => {
      if (nextStartSceneId !== undefined) {
        await tx.virtualTour.update({
          where: { id: tourId },
          data: { startSceneId: nextStartSceneId },
        });
      }

      return tx.virtualTourScene.delete({ where: { id: sceneId } });
    });
  }

  static async findLinkById(id: string) {
    return getPrisma().virtualTourLink.findUnique({
      where: { id },
      include: linkDetailInclude,
    });
  }

  static async listLinks(fromSceneId: string) {
    return getPrisma().virtualTourLink.findMany({
      where: { fromSceneId },
      include: linkDetailInclude,
      orderBy: linkOrder,
    });
  }

  static async createLink(
    fromSceneId: string,
    data: CreateVirtualTourLinkInput,
  ) {
    return getPrisma().virtualTourLink.create({
      data: { ...data, fromSceneId },
      include: linkDetailInclude,
    });
  }

  static async updateLink(id: string, data: UpdateVirtualTourLinkInput) {
    return getPrisma().virtualTourLink.update({
      where: { id },
      data,
      include: linkDetailInclude,
    });
  }

  static async deleteLink(id: string) {
    return getPrisma().virtualTourLink.delete({ where: { id } });
  }
}
