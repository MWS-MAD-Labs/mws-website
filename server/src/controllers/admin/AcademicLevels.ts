import type { Context } from "hono";
import { ResponseError } from "../../error/response-error";
import { toJsonSafe } from "../../lib/json-response";
import { AcademicPageService } from "../../services/academic-page-service";

type MultipartValue = string | File;
type MultipartBody = Record<string, MultipartValue | MultipartValue[]>;

function firstFormValue(value: MultipartValue | MultipartValue[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function textField(body: MultipartBody, key: string) {
  const value = firstFormValue(body[key]);
  return typeof value === "string" ? value : undefined;
}

function fileField(body: MultipartBody, key: string) {
  const value = firstFormValue(body[key]);
  return value instanceof File ? value : null;
}

async function readMultipartAsset(c: Context): Promise<{ file: File; type: "image" | "document" }> {
  const body = (await c.req.parseBody()) as MultipartBody;
  const file = fileField(body, "file");
  const type = textField(body, "type");

  if (!file) throw new ResponseError(400, "File is required.");
  if (type !== "image" && type !== "document") {
    throw new ResponseError(400, "Academic asset type must be image or document.");
  }

  return { file, type };
}

export class AdminAcademicLevelsController {
  static async list(c: Context) {
    return c.json({ data: toJsonSafe(await AcademicPageService.listLevels()) });
  }

  static async get(c: Context) {
    return c.json({
      data: toJsonSafe(await AcademicPageService.getLevel(c.req.param("levelKey"))),
    });
  }

  static async update(c: Context) {
    const body = await c.req.json();
    return c.json({
      data: toJsonSafe(
        await AcademicPageService.saveLevel(c.req.param("levelKey"), body),
      ),
    });
  }

  static async uploadAsset(c: Context) {
    const { file, type } = await readMultipartAsset(c);
    return c.json(
      {
        data: toJsonSafe(
          await AcademicPageService.uploadAsset(c.req.param("levelKey"), file, type),
        ),
      },
      201,
    );
  }
}
