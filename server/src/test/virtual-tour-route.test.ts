import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { Hono } from "hono";
import { ResponseError } from "../error/response-error";
import { adminVirtualTourRoute } from "../routes/admin/virtual-tour-route";
import { publicVirtualTourRoute } from "../routes/api/virtual-tour-route";
import { VirtualTourLinkService } from "../services/virtual-tour/virtual-tour-link";
import { VirtualTourSceneService } from "../services/virtual-tour/virtual-tour-scene";
import { VirtualTourService } from "../services/virtual-tour/virtual-tour";
import type { SessionVariables } from "../types/hono-context";
import { cmsSessionUser } from "./test-helpers";

const TOUR_ID = "11111111-1111-4111-8111-111111111111";
const SCENE_ID = "22222222-2222-4222-8222-222222222222";
const TARGET_ID = "33333333-3333-4333-8333-333333333333";

function adminApp() {
  const app = new Hono<{ Variables: SessionVariables }>();
  app.use("*", async (c, next) => {
    c.set("user", cmsSessionUser("ADMIN"));
    await next();
  });
  app.route("/virtual-tours", adminVirtualTourRoute);
  app.onError((error, c) => {
    if (error instanceof ResponseError) {
      return c.json({ errors: error.message }, error.status as 400);
    }
    return c.json({ errors: "Internal server error" }, 500);
  });
  return app;
}

function publicApp() {
  const app = new Hono();
  app.route("/virtual-tours", publicVirtualTourRoute);
  app.onError((error, c) => {
    if (error instanceof ResponseError) {
      return c.json({ errors: error.message }, error.status as 400);
    }
    return c.json({ errors: "Internal server error" }, 500);
  });
  return app;
}

afterEach(() => {
  mock.restore();
});

describe("adminVirtualTourRoute", () => {
  it("rejects malformed scene JSON before calling the service", async () => {
    const create = spyOn(VirtualTourSceneService, "create");
    const response = await adminApp().request(
      `/virtual-tours/${TOUR_ID}/scenes`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      },
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ errors: "Invalid JSON body." });
    expect(create).not.toHaveBeenCalled();
  });

  it("routes nested link creation to the link service", async () => {
    const create = spyOn(VirtualTourLinkService, "create").mockResolvedValue({
      id: "44444444-4444-4444-8444-444444444444",
    } as never);
    const body = { toSceneId: TARGET_ID, yaw: 90, pitch: 0 };

    const response = await adminApp().request(
      `/virtual-tours/${TOUR_ID}/scenes/${SCENE_ID}/links`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(TOUR_ID, SCENE_ID, body);
  });
});

describe("publicVirtualTourRoute", () => {
  it("returns a published tour by slug", async () => {
    spyOn(VirtualTourService, "getPublic").mockResolvedValue({
      id: TOUR_ID,
      title: "Elementary Building",
      slug: "elementary-building",
      description: null,
      startNodeId: "scene-1",
      nodes: [],
      publishedAt: null,
      updatedAt: new Date("2026-10-16T00:00:00.000Z"),
    });

    const response = await publicApp().request(
      "/virtual-tours/elementary-building",
    );

    expect(response.status).toBe(200);
    expect((await response.json() as { data: { slug: string } }).data.slug).toBe(
      "elementary-building",
    );
  });
});
