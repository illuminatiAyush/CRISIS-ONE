import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const createAdmin = (): SupabaseClient | undefined => {
  if (
    !process.env.NEXT_PRIVATE_SERVICE_ROLE_KEY ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL
  ) {
    console.error("Supabase keys not found");
    return;
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PRIVATE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
    }
  );

  return supabaseAdmin;
};
