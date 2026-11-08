import { describe, expect, it } from "vitest";
import { giftFormSchema, type GiftFormInput } from "@/lib/validations/gift";
import { categoryFormSchema, guideFormSchema, tagFormSchema } from "@/lib/validations/taxonomy";

const UUID = "2bd49f41-d5b7-523a-a6c3-5c5cb9e3ae96";

const valid: GiftFormInput = {
  title: "Pair of handmade ceramic mugs",
  slug: "handmade-ceramic-mugs",
  summary: "Two wheel-thrown mugs from a local potter.",
  description: "Handmade mugs are never quite identical, which makes a pair feel right.",
  whyThoughtful: "",
  keywords: "mugs, ceramic",
  mainImagePath: "gifts/2026/11/mugs.jpg",
  imageAlt: "Two ceramic mugs",
  gallery: [],
  categoryIds: [UUID],
  occasionIds: [],
  recipientIds: [],
  budgetId: "",
  priceAmount: "",
  currency: "BDT",
  priceCheckedAt: "",
  externalUrl: "",
  sourceName: "",
  isFeatured: false,
  status: "draft",
};

const fieldErrors = (input: unknown) => {
  const r = giftFormSchema.safeParse(input);
  return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]));
};

describe("giftFormSchema", () => {
  it("accepts a valid gift and normalises empty optionals to null", () => {
    const r = giftFormSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.whyThoughtful).toBeNull();
      expect(r.data.externalUrl).toBeNull();
      expect(r.data.priceAmount).toBeNull();
      expect(r.data.budgetId).toBeNull();
    }
  });

  it("requires a title, summary and description", () => {
    const e = fieldErrors({ ...valid, title: " ", summary: "short", description: "" });
    expect(Object.keys(e).sort()).toEqual(["description", "summary", "title"]);
  });

  it("rejects bad slugs", () => {
    expect(fieldErrors({ ...valid, slug: "Not A Slug" }).slug).toBeTruthy();
  });

  it("only allows http(s) links", () => {
    expect(fieldErrors({ ...valid, externalUrl: "javascript:alert(1)" }).externalUrl).toBeTruthy();
    expect(fieldErrors({ ...valid, externalUrl: "shop.example.com" }).externalUrl).toBeTruthy();
    expect(fieldErrors({ ...valid, externalUrl: "https://shop.example.com/item" }).externalUrl).toBeUndefined();
  });

  it("needs a currency and checked date for any price", () => {
    expect(fieldErrors({ ...valid, priceAmount: "2500", priceCheckedAt: "" }).priceCheckedAt).toBeTruthy();
    expect(fieldErrors({ ...valid, priceAmount: "2500", currency: "" }).currency).toBeTruthy();
    const ok = giftFormSchema.safeParse({ ...valid, priceAmount: "2500.456", priceCheckedAt: "2026-11-01" });
    expect(ok.success && ok.data.priceAmount).toBe(2500.46);
  });

  it("rejects negative or non-numeric prices", () => {
    expect(fieldErrors({ ...valid, priceAmount: "-5", priceCheckedAt: "2026-11-01" }).priceAmount).toBeTruthy();
    expect(fieldErrors({ ...valid, priceAmount: "abc", priceCheckedAt: "2026-11-01" }).priceAmount).toBeTruthy();
  });

  it("requires alt text when there is a main image", () => {
    expect(fieldErrors({ ...valid, imageAlt: "" }).imageAlt).toBeTruthy();
  });

  it("requires a main image before publishing", () => {
    expect(fieldErrors({ ...valid, status: "published", mainImagePath: "", imageAlt: "" }).mainImagePath).toBeTruthy();
  });

  it("rejects path traversal in image paths", () => {
    expect(fieldErrors({ ...valid, mainImagePath: "../secrets.jpg" }).mainImagePath).toBeTruthy();
  });

  it("rejects non-UUID ids", () => {
    expect(fieldErrors({ ...valid, categoryIds: ["not-a-uuid"] })["categoryIds.0"]).toBeTruthy();
  });

  it("requires alt text for gallery images", () => {
    expect(fieldErrors({ ...valid, gallery: [{ path: "gifts/a.jpg", alt: "" }] })["gallery.0.alt"]).toBeTruthy();
  });
});

describe("taxonomy schemas", () => {
  it("accepts a category and coerces the sort order", () => {
    const r = categoryFormSchema.safeParse({ name: "Keepsakes", slug: "keepsakes", description: "", imagePath: "", sortOrder: "3", isActive: true });
    expect(r.success && r.data.sortOrder).toBe(3);
  });

  it("restricts tag types", () => {
    const r = tagFormSchema.safeParse({ name: "Mehendi", slug: "mehendi", tagType: "colour", description: "", sortOrder: 0, isActive: true });
    expect(r.success).toBe(false);
  });

  it("requires a cover description when a guide has a cover", () => {
    const r = guideFormSchema.safeParse({
      title: "Holud gifts",
      slug: "holud-gifts",
      introduction: "A guide to gifts for the holud ceremony.",
      content: "",
      coverImagePath: "guides/cover.jpg",
      coverImageAlt: "",
      giftIds: [],
      status: "draft",
    });
    expect(r.success).toBe(false);
  });
});
