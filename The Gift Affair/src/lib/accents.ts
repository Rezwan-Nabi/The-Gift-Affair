import { ACCENTS, type Accent } from "./constants";

/** Tailwind classes per accent. Text on every accent background is plum (WCAG AA). */
export const ACCENT_BG: Record<Accent, string> = {
  coral: "bg-coral",
  sunshine: "bg-sunshine",
  lavender: "bg-lavender",
  orange: "bg-orange",
  sage: "bg-sage",
};

export const ACCENT_SOFT_BG: Record<Accent, string> = {
  coral: "bg-coral-soft",
  sunshine: "bg-sunshine-soft",
  lavender: "bg-lavender-soft",
  orange: "bg-orange-soft",
  sage: "bg-sage-soft",
};

export function accentAt(index: number): Accent {
  return ACCENTS[((index % ACCENTS.length) + ACCENTS.length) % ACCENTS.length];
}

const OCCASION_ACCENTS: Record<string, Accent> = {
  holud: "sunshine",
  "wedding-ceremony": "coral",
  reception: "lavender",
};

export function occasionAccent(slug: string, index: number): Accent {
  return OCCASION_ACCENTS[slug] ?? accentAt(index);
}
