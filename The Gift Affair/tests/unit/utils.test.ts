import { describe, expect, it } from "vitest";
import { formatPrice, hostnameOf, imageUrl, isValidSlug, plural, slugify } from "@/lib/utils";

describe("slugify", () => {
  it("makes readable, URL-safe slugs", () => {
    expect(slugify("Hand-painted Kantha Quilt!")).toBe("hand-painted-kantha-quilt");
    expect(slugify("  Gifts for the Bride & Groom  ")).toBe("gifts-for-the-bride-and-groom");
    expect(slugify("Lover’s tea hamper")).toBe("lovers-tea-hamper");
    expect(slugify("Crème brûlée set")).toBe("creme-brulee-set");
  });

  it("collapses separators and trims hyphens", () => {
    expect(slugify("--a   b__c--")).toBe("a-b-c");
  });

  it("limits length without a trailing hyphen", () => {
    const s = slugify(`${"word ".repeat(30)}end`);
    expect(s.length <= 80).toBe(true);
    expect(s.endsWith("-")).toBe(false);
  });

  it("produces valid slugs", () => {
    expect(isValidSlug(slugify("Personalised nameplate for their first home"))).toBe(true);
  });
});

describe("isValidSlug", () => {
  it("rejects uppercase, spaces and double hyphens", () => {
    expect(isValidSlug("Gift")).toBe(false);
    expect(isValidSlug("a gift")).toBe(false);
    expect(isValidSlug("a--gift")).toBe(false);
    expect(isValidSlug("-gift")).toBe(false);
    expect(isValidSlug("gift-2")).toBe(true);
  });
});

describe("formatPrice", () => {
  it("shows the currency symbol and code", () => {
    expect(formatPrice(2500, "BDT")).toBe("৳2,500 BDT");
    expect(formatPrice(19.5, "usd")).toBe("$19.50 USD");
  });

  it("falls back to the code for unknown currencies", () => {
    expect(formatPrice(100, "AED")).toBe("100 AED");
  });

  it("returns null without an amount or currency", () => {
    expect(formatPrice(null, "BDT")).toBeNull();
    expect(formatPrice(100, null)).toBeNull();
  });
});

describe("imageUrl", () => {
  it("passes through local and absolute paths", () => {
    expect(imageUrl("/images/gifts/a.jpg")).toBe("/images/gifts/a.jpg");
    expect(imageUrl("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });

  it("returns null for empty values", () => {
    expect(imageUrl(null)).toBeNull();
    expect(imageUrl("")).toBeNull();
  });
});

describe("helpers", () => {
  it("hostnameOf strips www", () => {
    expect(hostnameOf("https://www.example.com/shop")).toBe("example.com");
  });
  it("plural", () => {
    expect(plural(1, "idea")).toBe("1 idea");
    expect(plural(3, "idea")).toBe("3 ideas");
  });
});
