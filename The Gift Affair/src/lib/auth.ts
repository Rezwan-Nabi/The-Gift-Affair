import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/types";

export type EditorSession = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string;
  displayName: string;
  role: Role;
};

/** The signed-in user with an admin/editor role, or null. Verified with Supabase Auth on every call. */
export const getEditor = cache(async (): Promise<EditorSession | null> => {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role, display_name").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && profile?.role !== "editor") return null;
  return {
    supabase,
    userId: user.id,
    email: user.email ?? "",
    displayName: profile.display_name || user.email || "Editor",
    role: profile.role,
  };
});

/** Use at the top of every admin page. Redirects anyone who isn't an editor. */
export async function requireEditor(): Promise<EditorSession> {
  const editor = await getEditor();
  if (!editor) redirect("/admin/login?error=access");
  return editor;
}
