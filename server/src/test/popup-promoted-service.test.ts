import { afterEach, describe, expect, it, mock, spyOn } from "bun:test";
import { ResponseError } from "../error/response-error";
import { PopupPromotedRepository } from "../repositories/popup-promoted-repository";
import { PopupPromotedService } from "../services/popup-promoted-service";
import { updatePopupPromotedSchema } from "../validation/schemas/popup-promoted-schema";

const POPUP_ID = "8d0a6a1e-2f4b-4c3a-9a51-3c2f7a0b9e11";

function storedPopup(overrides: Record<string, unknown> = {}) {
  return {
    id: POPUP_ID,
    title: "Open House",
    description: null,
    posterImagePath: null,
    posterImageAlt: null,
    buttonText: null,
    buttonUrl: null,
    targetType: null,
    targetId: null,
    openInNewTab: true,
    sortOrder: 4,
    isActive: false,
    activeFrom: new Date("2026-11-01T00:00:00.000Z"),
    activeUntil: new Date("2026-11-30T00:00:00.000Z"),
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    updatedAt: new Date("2026-10-01T00:00:00.000Z"),
    ...overrides,
  };
}

afterEach(() => {
  mock.restore();
});

describe("updatePopupPromotedSchema", () => {
  it("keeps a partial update partial instead of filling defaults", () => {
    const result = updatePopupPromotedSchema.safeParse({ title: "New title" });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ title: "New title" });
  });

  it("allows an update without a title", () => {
    const result = updatePopupPromotedSchema.safeParse({ isActive: true });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({ isActive: true });
  });

  it("rejects script URLs for the button", () => {
    const result = updatePopupPromotedSchema.safeParse({ buttonUrl: "javascript:alert(1)" });

    expect(result.success).toBe(false);
  });
});

describe("PopupPromotedService.update", () => {
  it("sends only the changed fields to the repository", async () => {
    spyOn(PopupPromotedRepository.prototype, "findById").mockResolvedValue(storedPopup());
    const update = spyOn(PopupPromotedRepository.prototype, "update").mockResolvedValue(
      storedPopup({ title: "New title" }),
    );

    await PopupPromotedService.update(POPUP_ID, { title: "New title" });

    expect(update).toHaveBeenCalledWith(POPUP_ID, { title: "New title" });
  });

  it("checks a new end date against the stored start date", async () => {
    spyOn(PopupPromotedRepository.prototype, "findById").mockResolvedValue(storedPopup());
    const update = spyOn(PopupPromotedRepository.prototype, "update");

    const error = await PopupPromotedService.update(POPUP_ID, {
      activeUntil: "2026-10-15T00:00:00.000Z",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ResponseError);
    expect((error as ResponseError).status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});
