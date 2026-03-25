import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const createAdmin = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const key = process.env.NEXT_PRIVATE_SERVICE_ROLE_KEY || "dummy-service-role-key";

  if (
    !process.env.NEXT_PRIVATE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    console.warn("WARNING: Supabase admin keys not found. Using dummy client.");
  }

  const supabaseAdmin = createClient(
    url,
    key,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    }
  );

  return supabaseAdmin;
};
