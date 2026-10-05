import { z } from "zod";

export const createPartnerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(225, "Name must be 225 characters or less"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(225, "Description must be 225 characters or less"),

  logo: z.string().trim().min(1, "Logo is required"),

  link: z.string().trim().optional(),

  status: z.string().trim().min(1, "Status is required"),
});

export const updatePartnerSchema = createPartnerSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field is required." },
);

export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
