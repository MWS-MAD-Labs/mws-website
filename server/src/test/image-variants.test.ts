import { beforeEach, describe, expect, it } from "bun:test";
import sharp from "sharp";
import { ResponseError } from "../error/response-error";
import { variantObjectNames } from "../lib/image-variant-names";
import {
  ensureImageVariant,
  parseVariantWidth,
  resetImageVariantState,
} from "../lib/image-variants";
import { resizeImage, webpFileName } from "../lib/optimize-image";

function fakeStorage(existing: string[] = []) {
  const objects = new Set(existing);
  const calls = { read: 0, write: 0, resize: 0, peakResizes: 0 };
  let resizing = 0;

  return {
    calls,
    objects,
    storage: {
      stat: async (name: string) => {
        if (!objects.has(name)) throw new ResponseError(404, "missing");
      },
      read: async () => {
        calls.read += 1;
        return Buffer.from("original");
      },
      write: async (name: string) => {
        calls.write += 1;
        objects.add(name);
      },
      resize: async () => {
        calls.resize += 1;
        resizing += 1;
        calls.peakResizes = Math.max(calls.peakResizes, resizing);
        await new Promise((resolve) => setTimeout(resolve, 5));
        resizing -= 1;
        return Buffer.from("small");
      },
    },
  };
}

beforeEach(() => resetImageVariantState());

describe("image variants", () => {
  it("accepts only the fixed widths", () => {
    expect(parseVariantWidth("640")).toBe(640);
    expect(parseVariantWidth("641")).toBeUndefined();
    expect(parseVariantWidth("99999")).toBeUndefined();
    expect(parseVariantWidth(undefined)).toBeUndefined();
  });

  it("creates a variant once and reuses it", async () => {
    const { storage, calls } = fakeStorage();

    const first = await ensureImageVariant("gallery/images/a.webp", 640, storage);
    const second = await ensureImageVariant("gallery/images/a.webp", 640, storage);

    expect(first).toBe("variants/w640/gallery/images/a.webp.webp");
    expect(second).toBe(first);
    expect(calls.resize).toBe(1);
  });

  it("does not resize when the variant is already stored", async () => {
    const { storage, calls } = fakeStorage(["variants/w320/news/images/b.webp.webp"]);
    await ensureImageVariant("news/images/b.webp", 320, storage);
    expect(calls.read).toBe(0);
  });

  it("shares one resize between simultaneous requests", async () => {
    const { storage, calls } = fakeStorage();
    await Promise.all(
      Array.from({ length: 10 }, () => ensureImageVariant("gallery/images/c.webp", 960, storage)),
    );
    expect(calls.resize).toBe(1);
  });

  it("runs at most two resizes at once", async () => {
    const { storage, calls } = fakeStorage();
    await Promise.all(
      Array.from({ length: 8 }, (_, index) =>
        ensureImageVariant(`gallery/images/${index}.webp`, 320, storage),
      ),
    );
    expect(calls.resize).toBe(8);
    expect(calls.peakResizes).toBe(2);
  });

  it("lists variants to delete with an original, never for a variant", () => {
    expect(variantObjectNames("gallery/images/a.webp")).toHaveLength(4);
    expect(variantObjectNames("variants/w320/gallery/images/a.webp.webp")).toEqual([]);
  });

  it("downscales to the asked width without enlarging", async () => {
    const photo = await sharp({
      create: { width: 1600, height: 900, channels: 3, background: "#ffffff" },
    })
      .jpeg()
      .toBuffer();

    expect((await sharp(await resizeImage(photo, 640)).metadata()).width).toBe(640);
    expect((await sharp(await resizeImage(photo, 2000)).metadata()).width).toBe(1600);
  });

  it("names stored uploads .webp", () => {
    expect(webpFileName("Photo.JPG")).toBe("Photo.webp");
    expect(webpFileName("no-extension")).toBe("no-extension.webp");
  });
});
