import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import { GalleryRepository } from "../repositories/gallery-repository";
import { VirtualTourRepository } from "../repositories/virtual-tour-repository";
import { VirtualTourLinkService } from "../services/virtual-tour/virtual-tour-link";
import { VirtualTourSceneService } from "../services/virtual-tour/virtual-tour-scene";
import { VirtualTourService } from "../services/virtual-tour/virtual-tour";

const TOUR_ID = "11111111-1111-4111-8111-111111111111";
const SCENE_ID = "22222222-2222-4222-8222-222222222222";
const TARGET_ID = "33333333-3333-4333-8333-333333333333";
const IMAGE_ID = "44444444-4444-4444-8444-444444444444";

function tour(overrides: Record<string, unknown> = {}) {
  return {
    id: TOUR_ID,
    title: "Elementary Building",
    slug: "elementary-building",
    description: null,
    status: "DRAFT",
    startSceneId: SCENE_ID,
    publishedAt: null,
    createdAt: new Date("2026-10-16T00:00:00.000Z"),
    updatedAt: new Date("2026-10-16T00:00:00.000Z"),
    startScene: null,
    scenes: [],
    ...overrides,
  };
}

function scene(overrides: Record<string, unknown> = {}) {
  return {
    id: SCENE_ID,
    tourId: TOUR_ID,
    panoramaImageId: IMAGE_ID,
    name: "Lobby",
    slug: "lobby",
    description: "Main lobby",
    initialYaw: 10,
    initialPitch: -5,
    sortOrder: 0,
    isActive: true,
    createdAt: new Date("2026-10-16T00:00:00.000Z"),
    updatedAt: new Date("2026-10-16T00:00:00.000Z"),
    panoramaImage: {
      id: IMAGE_ID,
      path: "gallery/images/lobby.jpg",
      title: "Lobby",
      caption: null,
    },
    outgoingLinks: [],
    ...overrides,
  };
}

afterEach(() => {
  mock.restore();
});

describe("VirtualTourService", () => {
  it("refuses to publish a tour without an active scene", async () => {
    spyOn(VirtualTourRepository, "findTourById").mockResolvedValue(tour() as never);
    const update = spyOn(VirtualTourRepository, "updateTour");

    const error = await VirtualTourService.update(TOUR_ID, {
      status: "PUBLISHED",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).message).toContain("at least one active scene");
    expect(update).not.toHaveBeenCalled();
  });

  it("normalizes a published tour for Photo Sphere Viewer", async () => {
    const target = scene({
      id: TARGET_ID,
      name: "Corridor",
      slug: "corridor",
      panoramaImage: {
        id: "55555555-5555-4555-8555-555555555555",
        path: "gallery/images/corridor.jpg",
        title: "Corridor",
        caption: null,
      },
    });
    const lobby = scene({
      outgoingLinks: [
        {
          id: "66666666-6666-4666-8666-666666666666",
          fromSceneId: SCENE_ID,
          toSceneId: TARGET_ID,
          label: "Go to corridor",
          yaw: 90,
          pitch: 0,
          sortOrder: 0,
          createdAt: new Date("2026-10-16T00:00:00.000Z"),
          updatedAt: new Date("2026-10-16T00:00:00.000Z"),
          toScene: {
            id: TARGET_ID,
            tourId: TOUR_ID,
            name: "Corridor",
            slug: "corridor",
            isActive: true,
          },
        },
      ],
    });

    spyOn(VirtualTourRepository, "findPublishedTourBySlug").mockResolvedValue(
      tour({
        status: "PUBLISHED",
        scenes: [lobby, target],
        publishedAt: new Date("2026-10-16T01:00:00.000Z"),
      }) as never,
    );

    const result = await VirtualTourService.getPublic("elementary-building");

    expect(result.startNodeId).toBe(SCENE_ID);
    expect(result.nodes[0]?.panorama).toBe(`/api/gallery-images/${IMAGE_ID}/file`);
    expect(result.nodes[0]?.links[0]).toEqual({
      nodeId: TARGET_ID,
      position: { yaw: "90deg", pitch: "0deg" },
      data: { label: "Go to corridor" },
    });
  });
});

describe("VirtualTourSceneService", () => {
  it("requires the panorama to exist in Gallery", async () => {
    spyOn(VirtualTourRepository, "findTourById").mockResolvedValue(tour() as never);
    spyOn(GalleryRepository, "findImageById").mockResolvedValue(null);
    const create = spyOn(VirtualTourRepository, "createScene");

    const error = await VirtualTourSceneService.create(TOUR_ID, {
      panoramaImageId: IMAGE_ID,
      name: "Lobby",
      slug: "lobby",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).message).toContain("Gallery library");
    expect(create).not.toHaveBeenCalled();
  });
});

describe("VirtualTourLinkService", () => {
  it("does not allow links to a scene in another tour", async () => {
    spyOn(VirtualTourRepository, "findSceneById")
      .mockResolvedValueOnce(scene() as never)
      .mockResolvedValueOnce(
        scene({
          id: TARGET_ID,
          tourId: "77777777-7777-4777-8777-777777777777",
        }) as never,
      );
    const create = spyOn(VirtualTourRepository, "createLink");

    const error = await VirtualTourLinkService.create(TOUR_ID, SCENE_ID, {
      toSceneId: TARGET_ID,
      yaw: 90,
      pitch: 0,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).message).toContain("same virtual tour");
    expect(create).not.toHaveBeenCalled();
  });
});
