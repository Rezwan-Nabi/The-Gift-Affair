export const SITE_NAME = "The Gift Affair"; // working name from the PRD — change before launch
export const SITE_TAGLINE = "Find a gift worth remembering.";
export const SITE_DESCRIPTION =
  "Curated wedding gifts for the holud, the wedding and the reception, organised by recipient, category and budget.";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const PAGE_SIZE = 12;
export const STORAGE_BUCKET = "gift-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;

/** Accent colour per occasion/category slug, used for card backgrounds. Falls back by index. */
export const ACCENTS = ["coral", "sunshine", "lavender", "orange", "sage"] as const;
export type Accent = (typeof ACCENTS)[number];

export const SOCIAL_LINKS: { label: string; href: string }[] = [
  // TODO: replace with real profiles, or leave empty to hide.
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "Facebook", href: "https://facebook.com/" },
  { label: "Pinterest", href: "https://pinterest.com/" },
];

export const CONTACT_EMAIL = "hello@example.com"; // TODO
