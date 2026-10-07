import { describe, expect, it } from "bun:test";
import { ResponseError } from "../error/response-error";
import {
  ContactPageService,
  defaultContactPageContent,
  normalizeMapEmbedSrc,
} from "../services/contact-page-service";

const embedUrl = defaultContactPageContent.map.src;

describe("normalizeMapEmbedSrc", () => {
  it("keeps a Google Maps embed URL", () => {
    expect(normalizeMapEmbedSrc(embedUrl)).toBe(new URL(embedUrl).toString());
  });

  it("extracts the URL from pasted iframe code", () => {
    const iframe = `<iframe src="${embedUrl.replace(/&/g, "&amp;")}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;

    expect(normalizeMapEmbedSrc(iframe)).toBe(new URL(embedUrl).toString());
  });

  it("accepts the legacy output=embed form", () => {
    expect(
      normalizeMapEmbedSrc("https://maps.google.com/maps?q=Millennia%20World%20School&output=embed"),
    ).not.toBeNull();
  });

  it.each([
    "https://maps.app.goo.gl/abc123",
    "https://www.google.com/maps/place/Millennia+World+School/@-6.3,106.7,17z",
    "http://www.google.com/maps/embed?pb=abc",
    "https://evil.example.com/maps/embed?pb=abc",
    "not a url",
    '<iframe width="600"></iframe>',
  ])("refuses %s", (input) => {
    expect(normalizeMapEmbedSrc(input)).toBeNull();
  });
});

describe("ContactPageService.update map check", () => {
  it("refuses a share link before saving", async () => {
    const payload = {
      ...defaultContactPageContent,
      map: { ...defaultContactPageContent.map, src: "https://maps.app.goo.gl/abc123" },
    };

    try {
      await ContactPageService.update(payload, null);
      throw new Error("Expected ResponseError.");
    } catch (error) {
      expect(error).toBeInstanceOf(ResponseError);
      expect((error as ResponseError).status).toBe(400);
      expect((error as ResponseError).message).toContain("Google Maps embed");
    }
  });
});
