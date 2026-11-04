import { describe, expect, it } from "bun:test";
import { sanitizeHtml } from "../lib/sanitize-html";
import sharp from "sharp";
import { optimizeImage } from "../lib/optimize-image";
import {
  assertPublicHttpUrl,
  googlePhotosImageUrl,
  sizedGooglePhotoUrl,
  detectImageKind,
  directImageUrl,
  fetchRemoteImage,
  isPrivateAddress,
} from "../lib/remote-image";

const NAME = "3f2504e0-4f89-41d3-9a0c-0305e82c3301.webp";
const SRC = `/api/news/content-images/${NAME}`;

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
const publicResolver = async () => ["142.250.4.100"];

describe("sanitizeHtml article images", () => {
  it("keeps an uploaded content image without double-escaping alt", () => {
    expect(sanitizeHtml(`<p>a</p><img src="${SRC}" alt="Kids &quot;playing&quot;" title="x" width="10"><p>b</p>`)).toBe(
      `<p>a</p><img src="${SRC}" alt="Kids &quot;playing&quot;"><p>b</p>`,
    );
  });

  it("drops images from anywhere else", () => {
    for (const src of [
      "https://evil.example/pixel.gif",
      "data:image/png;base64,AAAA",
      "/api/news/content-images/../../admin",
      "/api/news/media/123/file",
      `//evil.example${SRC}`,
    ]) {
      expect(sanitizeHtml(`<img src="${src}" alt="x">`)).toBe("");
    }
  });

  it("drops event handler attributes", () => {
    expect(sanitizeHtml(`<img src="${SRC}" onerror="alert(1)">`)).toBe(
      `<img src="${SRC}" alt="">`,
    );
  });
});

describe("remote image helpers", () => {
  it("detects images by their bytes, not their name", () => {
    expect(detectImageKind(JPEG)?.contentType).toBe("image/jpeg");
    expect(detectImageKind(new TextEncoder().encode("<!doctype html>"))).toBeNull();
  });

  it("turns Google Drive share links into direct downloads", () => {
    expect(
      directImageUrl("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing").href,
    ).toBe("https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOp");
    expect(directImageUrl("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOp").href).toBe(
      "https://drive.google.com/uc?export=download&id=1AbCdEfGhIjKlMnOp",
    );
  });

  it("flags internal addresses", () => {
    for (const address of ["127.0.0.1", "10.1.2.3", "172.20.0.5", "192.168.1.1", "169.254.169.254", "::1", "fd00::1", "::ffff:10.0.0.1"]) {
      expect(isPrivateAddress(address)).toBe(true);
    }
    expect(isPrivateAddress("142.250.4.100")).toBe(false);
  });

  it("refuses links into the internal network", async () => {
    await expect(assertPublicHttpUrl(new URL("http://169.254.169.254/latest"))).rejects.toThrow();
    await expect(
      assertPublicHttpUrl(new URL("http://minio:9000/bucket"), async () => ["172.18.0.3"]),
    ).rejects.toThrow();
    await expect(assertPublicHttpUrl(new URL("file:///etc/passwd"))).rejects.toThrow();
  });

  it("re-checks every redirect hop", async () => {
    const fetchImpl = (async () =>
      new Response(null, {
        status: 302,
        headers: { location: "http://127.0.0.1/secret" },
      })) as unknown as typeof fetch;

    await expect(
      fetchRemoteImage("https://example.com/a.jpg", {
        maxBytes: 1024,
        resolve: publicResolver,
        fetchImpl,
      }),
    ).rejects.toThrow("public website");
  });

  it("rejects a page that is not an image, like an unshared Drive file", async () => {
    const fetchImpl = (async () =>
      new Response("<html>Sign in</html>", { status: 200 })) as unknown as typeof fetch;

    await expect(
      fetchRemoteImage("https://example.com/a.jpg", {
        maxBytes: 1024,
        resolve: publicResolver,
        fetchImpl,
      }),
    ).rejects.toThrow("Anyone with the link");
  });

  it("stops reading past the size limit", async () => {
    const fetchImpl = (async () =>
      new Response(new Uint8Array(4096), { status: 200 })) as unknown as typeof fetch;

    await expect(
      fetchRemoteImage("https://example.com/a.jpg", {
        maxBytes: 1024,
        resolve: publicResolver,
        fetchImpl,
      }),
    ).rejects.toThrow("or smaller");
  });

  it("returns the image after following a public redirect", async () => {
    let calls = 0;
    const fetchImpl = (async () => {
      calls += 1;
      return calls === 1
        ? new Response(null, { status: 303, headers: { location: "https://cdn.example.com/x" } })
        : new Response(JPEG, { status: 200 });
    }) as unknown as typeof fetch;

    const result = await fetchRemoteImage("https://example.com/a.jpg", {
      maxBytes: 1024,
      resolve: publicResolver,
      fetchImpl,
    });

    expect(result.kind.extension).toBe("jpg");
    expect(calls).toBe(2);
  });
});

describe("Google Photos and CDN links", () => {
  it("caps the size asked from Google's photo CDN", () => {
    expect(
      sizedGooglePhotoUrl(new URL("https://lh3.googleusercontent.com/pw/AP1Gcz-abc=s0")).href,
    ).toBe("https://lh3.googleusercontent.com/pw/AP1Gcz-abc=w2000-h2000");
    expect(
      sizedGooglePhotoUrl(new URL("https://lh3.googleusercontent.com/pw/AP1Gcz-abc")).href,
    ).toBe("https://lh3.googleusercontent.com/pw/AP1Gcz-abc=w2000-h2000");
    expect(sizedGooglePhotoUrl(new URL("https://example.com/a=s0")).href).toBe(
      "https://example.com/a=s0",
    );
  });

  it("reads the photo from a share page's og:image", () => {
    const html = `<head><meta property="og:image" content="https://lh3.googleusercontent.com/pw/AP1Gcz-xyz=w600-h315-p-k"></head>`;
    expect(googlePhotosImageUrl(html)?.href).toBe(
      "https://lh3.googleusercontent.com/pw/AP1Gcz-xyz=w2000-h2000",
    );
    expect(
      googlePhotosImageUrl(`<meta property="og:image" content="https://evil.example/x.jpg">`),
    ).toBeNull();
  });

  it("follows a Google Photos share link to the photo", async () => {
    const seen: string[] = [];
    const fetchImpl = (async (input: URL) => {
      seen.push(input.href);
      if (input.hostname === "photos.app.goo.gl") {
        return new Response(null, {
          status: 302,
          headers: { location: "https://photos.google.com/share/AF1Qip?key=abc" },
        });
      }
      if (input.hostname === "photos.google.com") {
        return new Response(
          `<meta property="og:image" content="https://lh3.googleusercontent.com/pw/AP1Gcz-xyz=w600-h315-p-k">`,
        );
      }
      return new Response(JPEG);
    }) as unknown as typeof fetch;

    const result = await fetchRemoteImage("https://photos.app.goo.gl/AbCd1234", {
      maxBytes: 1024,
      resolve: publicResolver,
      fetchImpl,
    });

    expect(result.kind.extension).toBe("jpg");
    expect(seen.at(-1)).toBe("https://lh3.googleusercontent.com/pw/AP1Gcz-xyz=w2000-h2000");
  });
});

describe("optimizeImage", () => {
  it("shrinks a large photo to 2000px WebP", async () => {
    const big = await sharp({
      create: { width: 4000, height: 3000, channels: 3, background: "#7e1518" },
    })
      .jpeg()
      .toBuffer();

    const result = await optimizeImage(big);

    expect([result.width, result.height]).toEqual([2000, 1500]);
    expect(detectImageKind(result.bytes)?.contentType).toBe("image/webp");
  });

  it("never enlarges a small image", async () => {
    const small = await sharp({
      create: { width: 300, height: 200, channels: 3, background: "#ffffff" },
    })
      .png()
      .toBuffer();

    const result = await optimizeImage(small);
    expect([result.width, result.height]).toEqual([300, 200]);
  });

  it("rejects bytes that only look like an image", async () => {
    await expect(optimizeImage(JPEG)).rejects.toThrow("could not be read");
  });
});
