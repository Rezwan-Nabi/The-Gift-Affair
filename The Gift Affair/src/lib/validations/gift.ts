import { z } from "zod";
import { isValidSlug } from "@/lib/utils";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional()
    .transform((v) => v ?? null);

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Add a URL slug.")
  .max(80, "Use 80 characters or fewer.")
  .refine(isValidSlug, "Use lowercase letters, numbers and single hyphens, like personalised-photo-frame.");

/** http(s) only — blocks javascript:, data: and other schemes in outbound links. */
export const externalUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => {
    if (v === "") return true;
    try {
      const u = new URL(v);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, "Enter a full web address starting with https://.")
  .transform((v) => (v === "" ? null : v));

export const imagePathSchema = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || !v.includes(".."), "That image path isn't valid.")
  .transform((v) => (v === "" ? null : v));

export const statusSchema = z.enum(["draft", "published", "archived"]);

export const galleryImageSchema = z.object({
  path: z.string().trim().min(1).max(500),
  alt: z.string().trim().min(1, "Describe this image for people who can't see it.").max(250),
});

export const giftFormSchema = z
  .object({
    title: z.string().trim().min(3, "Add a title of at least 3 characters.").max(120, "Use 120 characters or fewer."),
    slug: slugSchema,
    summary: z
      .string()
      .trim()
      .min(10, "Add a short summary (at least 10 characters).")
      .max(200, "Keep the summary to 200 characters so cards stay tidy."),
    description: z.string().trim().min(20, "Add a description of at least 20 characters.").max(5000),
    whyThoughtful: optionalText(1500),
    keywords: optionalText(300),
    mainImagePath: imagePathSchema,
    imageAlt: optionalText(250),
    gallery: z.array(galleryImageSchema).max(8, "Add up to 8 gallery images."),
    categoryIds: z.array(z.uuid()).max(10),
    occasionIds: z.array(z.uuid()).max(10),
    recipientIds: z.array(z.uuid()).max(10),
    budgetId: z.union([z.uuid(), z.literal("")]).transform((v) => (v === "" ? null : v)),
    priceAmount: z
      .union([z.number(), z.string()])
      .transform((v, ctx) => {
        if (v === "" || v === null) return null;
        const n = typeof v === "number" ? v : Number(v);
        if (!Number.isFinite(n) || n < 0 || n > 100_000_000) {
          ctx.addIssue({ code: "custom", message: "Enter a price as a positive number, or leave it blank." });
          return z.NEVER;
        }
        return Math.round(n * 100) / 100;
      })
      .nullable(),
    currency: z
      .string()
      .trim()
      .toUpperCase()
      .refine((v) => v === "" || /^[A-Z]{3}$/.test(v), "Use a 3-letter currency code, like BDT.")
      .transform((v) => (v === "" ? null : v)),
    priceCheckedAt: z
      .string()
      .trim()
      .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date.")
      .transform((v) => (v === "" ? null : v)),
    externalUrl: externalUrlSchema,
    sourceName: optionalText(80),
    isFeatured: z.boolean(),
    status: statusSchema,
  })
  .superRefine((g, ctx) => {
    if (g.mainImagePath && !g.imageAlt) {
      ctx.addIssue({ code: "custom", path: ["imageAlt"], message: "Describe the main image for people who can't see it." });
    }
    // PRD §7.2: never show a price without currency and a checked date.
    if (g.priceAmount != null && (!g.currency || !g.priceCheckedAt)) {
      ctx.addIssue({
        code: "custom",
        path: [!g.currency ? "currency" : "priceCheckedAt"],
        message: "A price needs a currency and the date you last checked it.",
      });
    }
    if (g.status === "published" && !g.mainImagePath) {
      ctx.addIssue({ code: "custom", path: ["mainImagePath"], message: "Add a main image before publishing." });
    }
  });

/** What the form holds (strings and booleans), before parsing. */
export type GiftFormInput = z.input<typeof giftFormSchema>;
/** What the server stores, after parsing. */
export type GiftFormData = z.output<typeof giftFormSchema>;
