import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { STORAGE_BUCKET } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "Hand-painted Kantha Quilt!" → "hand-painted-kantha-quilt" */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Turns a stored image reference into a URL.
 * - "/images/…" and "https://…" are used as they are (bundled demo images, absolute URLs)
 * - anything else is treated as a path inside the Supabase Storage bucket
 */
export function imageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/") || /^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/storage/v1/object/public/${STORAGE_BUCKET}/${path.replace(/^\/+/, "")}`;
}

const CURRENCY_SYMBOLS: Record<string, string> = { BDT: "৳", USD: "$", GBP: "£", EUR: "€", INR: "₹" };

export function formatPrice(amount: number | null, currency: string | null): string | null {
  if (amount == null || !currency) return null;
  const code = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code];
  const digits = Number.isInteger(amount) ? 0 : 2;
  const n = new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(amount);
  return symbol ? `${symbol}${n} ${code}` : `${n} ${code}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
