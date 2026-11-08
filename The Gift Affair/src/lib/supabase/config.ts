export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
/** Publishable key (sb_publishable_…) or the legacy anon key. Safe for the browser; RLS protects data. */
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Without Supabase the public site runs on the bundled demo content and the admin area is disabled. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
