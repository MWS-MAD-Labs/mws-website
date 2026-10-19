import { z } from "zod";

const optionalText = (max: number) =>
  z.preprocess(
    (value) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed || null;
      }
      return value;
    },
    z.string().max(max).nullable().optional(),
  );

const slug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(255, "Slug must be 255 characters or less")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers, and hyphens only",
  );

const tourFields = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  slug,
  description: optionalText(5000),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  startSceneId: z.string().uuid().nullable(),
} satisfies z.ZodRawShape;

export const createVirtualTourSchema = z.object({
  ...tourFields,
  status: tourFields.status.optional().default("DRAFT"),
  startSceneId: tourFields.startSceneId.optional().default(null),
});

export const updateVirtualTourSchema = z
  .object(tourFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

const sceneFields = {
  panoramaImageId: z.string().uuid("Panorama image id must be a valid UUID"),
  name: z
    .string()
    .trim()
    .min(1, "Scene name is required")
    .max(255, "Scene name must be 255 characters or less"),
  slug,
  description: optionalText(5000),
  initialYaw: z.number().finite(),
  initialPitch: z.number().finite().min(-90).max(90),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
} satisfies z.ZodRawShape;

export const createVirtualTourSceneSchema = z.object({
  ...sceneFields,
  initialYaw: sceneFields.initialYaw.optional().default(0),
  initialPitch: sceneFields.initialPitch.optional().default(0),
  sortOrder: sceneFields.sortOrder.optional().default(0),
  isActive: sceneFields.isActive.optional().default(true),
});

export const updateVirtualTourSceneSchema = z
  .object(sceneFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

const linkFields = {
  toSceneId: z.string().uuid("Target scene id must be a valid UUID"),
  label: optionalText(255),
  yaw: z.number().finite(),
  pitch: z.number().finite().min(-90).max(90),
  sortOrder: z.number().int(),
} satisfies z.ZodRawShape;

export const createVirtualTourLinkSchema = z.object({
  ...linkFields,
  sortOrder: linkFields.sortOrder.optional().default(0),
});

export const updateVirtualTourLinkSchema = z
  .object(linkFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export type CreateVirtualTourInput = z.infer<typeof createVirtualTourSchema>;
export type UpdateVirtualTourInput = z.infer<typeof updateVirtualTourSchema>;
export type CreateVirtualTourSceneInput = z.infer<
  typeof createVirtualTourSceneSchema
>;
export type UpdateVirtualTourSceneInput = z.infer<
  typeof updateVirtualTourSceneSchema
>;
export type CreateVirtualTourLinkInput = z.infer<
  typeof createVirtualTourLinkSchema
>;
export type UpdateVirtualTourLinkInput = z.infer<
  typeof updateVirtualTourLinkSchema
>;
