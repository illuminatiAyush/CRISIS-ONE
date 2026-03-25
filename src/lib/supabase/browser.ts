"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseSchema = any;

let client: SupabaseClient<SupabaseSchema> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<SupabaseSchema> {
  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "WARNING: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
    return null as any;
  }

  client = createBrowserClient<SupabaseSchema>(supabaseUrl, supabaseAnonKey);
  console.log("client created")
  return client;
}