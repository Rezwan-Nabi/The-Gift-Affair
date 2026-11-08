"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { dbErrorResult, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { getEditor } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { giftFormSchema, statusSchema, type GiftFormInput } from "@/lib/validations/gift";
import {
  categoryFormSchema,
  guideFormSchema,
  tagFormSchema,
  type CategoryFormInput,
  type GuideFormInput,
  type TagFormInput,
} from "@/lib/validations/taxonomy";

/*
 * Every action: (1) re-checks the editor role on the server, (2) validates input with Zod,
 * (3) writes as the signed-in user so RLS applies, (4) revalidates public pages.
 */

const idSchema = z.uuid();
const NOT_ALLOWED = { ok: false as const, message: "Your session has ended or you don't have editor access. Sign in again." };

function refreshPublicSite() {
  revalidatePath("/", "layout");
}

// ─── Auth ────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.email("Enter the email address for your admin account."),
  password: z.string().min(1, "Enter your password."),
  next: z.string().optional(),
});

export type LoginState = { message?: string; fieldErrors?: Record<string, string>; email?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured) return { message: "Supabase isn't configured yet, so sign-in is unavailable." };
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error.issues), email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
  if (error) return { message: "That email and password don't match an admin account.", email };

  const editor = await getEditor();
  if (!editor) {
    await supabase.auth.signOut();
    return { message: "This account doesn't have editor access. Ask an admin to grant it.", email };
  }
  const next = parsed.data.next;
  redirect(next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// ─── Gifts ────────────────────────────────────────────────────────────

export async function saveGift(id: string | null, input: GiftFormInput): Promise<ActionResult<{ id: string }>> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  if (id !== null && !idSchema.safeParse(id).success) return { ok: false, message: "Unknown gift." };

  const parsed = giftFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Some details need fixing.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  }
  const g = parsed.data;
  const tagIds = [...g.occasionIds, ...g.recipientIds, ...(g.budgetId ? [g.budgetId] : [])];

  const { data, error } = await editor.supabase.rpc("save_gift", {
    p_id: id,
    p_gift: {
      title: g.title,
      slug: g.slug,
      summary: g.summary,
      description: g.description,
      why_it_is_thoughtful: g.whyThoughtful,
      keywords: g.keywords,
      main_image_path: g.mainImagePath,
      image_alt: g.imageAlt,
      price_amount: g.priceAmount,
      currency: g.currency,
      price_checked_at: g.priceCheckedAt,
      external_url: g.externalUrl,
      source_name: g.sourceName,
      is_featured: g.isFeatured,
      status: g.status,
    },
    p_category_ids: g.categoryIds,
    p_tag_ids: tagIds,
    p_images: g.gallery,
  });
  if (error) return dbErrorResult(error, "gift");

  refreshPublicSite();
  revalidatePath("/admin", "layout");
  return { ok: true, data: { id: data as string } };
}

export async function setGiftStatus(id: string, status: string): Promise<ActionResult> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  const s = statusSchema.safeParse(status);
  if (!idSchema.safeParse(id).success || !s.success) return { ok: false, message: "Invalid request." };

  if (s.data === "published") {
    const { data } = await editor.supabase.from("gift_ideas").select("main_image_path").eq("id", id).maybeSingle();
    if (!data?.main_image_path) return { ok: false, message: "Add a main image before publishing this gift." };
  }
  const { error } = await editor.supabase.from("gift_ideas").update({ status: s.data }).eq("id", id);
  if (error) return dbErrorResult(error, "gift");
  refreshPublicSite();
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteGift(id: string): Promise<ActionResult> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid request." };
  const { error, count } = await editor.supabase.from("gift_ideas").delete({ count: "exact" }).eq("id", id);
  if (error) return dbErrorResult(error, "gift idea");
  if (!count) return { ok: false, message: "This gift was already deleted, or you don't have permission." };
  refreshPublicSite();
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ─── Categories & tags ───────────────────────────────────────────────

export async function saveCategory(id: string | null, input: CategoryFormInput): Promise<ActionResult> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Some details need fixing.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const c = parsed.data;
  const row = {
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_path: c.imagePath,
    sort_order: c.sortOrder,
    is_active: c.isActive,
  };
  const { error } = id
    ? await editor.supabase.from("categories").update(row).eq("id", id)
    : await editor.supabase.from("categories").insert(row);
  if (error) return dbErrorResult(error, "category");
  refreshPublicSite();
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid request." };
  const { error } = await editor.supabase.from("categories").delete().eq("id", id);
  if (error) return dbErrorResult(error, "category");
  refreshPublicSite();
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function saveTag(id: string | null, input: TagFormInput): Promise<ActionResult> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Some details need fixing.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const t = parsed.data;
  const row = {
    name: t.name,
    slug: t.slug,
    tag_type: t.tagType,
    description: t.description,
    sort_order: t.sortOrder,
    is_active: t.isActive,
  };
  const { error } = id
    ? await editor.supabase.from("tags").update(row).eq("id", id)
    : await editor.supabase.from("tags").insert(row);
  if (error) return dbErrorResult(error, "tag");
  refreshPublicSite();
  revalidatePath("/admin/tags");
  return { ok: true };
}

export async function deleteTag(id: string): Promise<ActionResult> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid request." };
  const { error } = await editor.supabase.from("tags").delete().eq("id", id);
  if (error) return dbErrorResult(error, "tag");
  refreshPublicSite();
  revalidatePath("/admin/tags");
  return { ok: true };
}

// ─── Guides ──────────────────────────────────────────────────────────

export async function saveGuide(id: string | null, input: GuideFormInput): Promise<ActionResult<{ id: string }>> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  if (id !== null && !idSchema.safeParse(id).success) return { ok: false, message: "Unknown guide." };
  const parsed = guideFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Some details need fixing.", fieldErrors: zodFieldErrors(parsed.error.issues) };
  const g = parsed.data;
  const { data, error } = await editor.supabase.rpc("save_guide", {
    p_id: id,
    p_guide: {
      title: g.title,
      slug: g.slug,
      introduction: g.introduction,
      content: g.content,
      cover_image_path: g.coverImagePath,
      cover_image_alt: g.coverImageAlt,
      status: g.status,
    },
    p_gift_ids: g.giftIds,
  });
  if (error) return dbErrorResult(error, "guide");
  refreshPublicSite();
  revalidatePath("/admin", "layout");
  return { ok: true, data: { id: data as string } };
}

export async function deleteGuide(id: string): Promise<ActionResult> {
  const editor = await getEditor();
  if (!editor) return NOT_ALLOWED;
  if (!idSchema.safeParse(id).success) return { ok: false, message: "Invalid request." };
  const { error } = await editor.supabase.from("gift_guides").delete().eq("id", id);
  if (error) return dbErrorResult(error, "guide");
  refreshPublicSite();
  revalidatePath("/admin", "layout");
  return { ok: true };
}
