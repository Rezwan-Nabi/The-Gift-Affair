import { z } from "zod";
import { imagePathSchema, slugSchema, statusSchema } from "./gift";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

export const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Add a name.").max(60, "Use 60 characters or fewer."),
  slug: slugSchema,
  description: optionalText(300),
  imagePath: imagePathSchema,
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export const tagFormSchema = z.object({
  name: z.string().trim().min(2, "Add a name.").max(60, "Use 60 characters or fewer."),
  slug: slugSchema,
  tagType: z.enum(["occasion", "recipient", "budget"]),
  description: optionalText(200),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export const guideFormSchema = z
  .object({
    title: z.string().trim().min(3, "Add a title.").max(140),
    slug: slugSchema,
    introduction: z.string().trim().min(20, "Add an introduction of at least 20 characters.").max(600),
    content: z.string().trim().max(20000),
    coverImagePath: imagePathSchema,
    coverImageAlt: optionalText(250),
    giftIds: z.array(z.uuid()).max(40),
    status: statusSchema,
  })
  .superRefine((g, ctx) => {
    if (g.coverImagePath && !g.coverImageAlt) {
      ctx.addIssue({ code: "custom", path: ["coverImageAlt"], message: "Describe the cover image." });
    }
  });

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type TagFormInput = z.input<typeof tagFormSchema>;
export type GuideFormInput = z.input<typeof guideFormSchema>;
export type GuideFormData = z.output<typeof guideFormSchema>;
