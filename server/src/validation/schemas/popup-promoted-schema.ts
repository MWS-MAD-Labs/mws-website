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

const optionalDate = z.preprocess(
  (value) => {
    if (value === undefined) return undefined;
    if (value === null || value === "") return null;
    return value;
  },
  z.coerce.date().nullable().optional(),
);

const popupUrl = optionalText(1000).refine(
  (value) => {
    if (!value) return true;
    if (value.startsWith("/")) return !value.startsWith("//");
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  },
  "URL must be an internal path or an http/https URL",
);

const popupPromotedFields = {
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: optionalText(5000),
  posterImagePath: optionalText(1000),
  posterImageAlt: optionalText(255),
  buttonText: optionalText(100),
  buttonUrl: popupUrl,
  targetType: optionalText(50),
  targetId: optionalText(255),
  openInNewTab: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  activeFrom: optionalDate,
  activeUntil: optionalDate,
} satisfies z.ZodRawShape;

const popupPromotedCreateSchema = z.object({
  ...popupPromotedFields,
  openInNewTab: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// Partial without defaults: a PATCH changes only the fields it sends.
const popupPromotedUpdateSchema = z.object(popupPromotedFields).partial();

type ActiveRangeInput = {
  activeFrom?: Date | null;
  activeUntil?: Date | null;
};

function hasValidActiveRange(value: ActiveRangeInput) {
  return (
    !value.activeFrom ||
    !value.activeUntil ||
    value.activeUntil.getTime() >= value.activeFrom.getTime()
  );
}

function withValidActiveRange<T extends z.ZodTypeAny>(schema: T) {
  return schema.refine(
    (value) => hasValidActiveRange(value as ActiveRangeInput),
    {
      message: "Active until must be after active from",
      path: ["activeUntil"],
    },
  );
}

export const createPopupPromotedSchema = withValidActiveRange(
  popupPromotedCreateSchema,
);

export const updatePopupPromotedSchema = withValidActiveRange(
  popupPromotedUpdateSchema.refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  }),
);

export type CreatePopupPromotedInput = z.infer<
  typeof createPopupPromotedSchema
>;
export type UpdatePopupPromotedInput = z.infer<
  typeof updatePopupPromotedSchema
>;
