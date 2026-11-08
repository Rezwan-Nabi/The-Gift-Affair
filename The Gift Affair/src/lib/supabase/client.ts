"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./config";

/** Browser client, used only by the admin image uploader. Storage policies restrict uploads to editors. */
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
