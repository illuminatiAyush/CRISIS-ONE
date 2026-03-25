import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getEnvironmentVariables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("WARNING: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { supabaseUrl, supabaseAnonKey };
}

export async function createSupabaseServerClient(access_token?: string) {
  const { supabaseUrl, supabaseAnonKey } = getEnvironmentVariables();
  
  // Use dummy values if missing to avoid build-time crashes and TS errors
  const effectiveUrl = supabaseUrl || "https://placeholder-project.supabase.co";
  const effectiveKey = supabaseAnonKey || "dummy-key";

  const cookieStore = await cookies();

  return createServerClient(effectiveUrl, effectiveKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => 
            cookieStore.set(name, value, options)
          );
        } catch(error) {
          console.log(error)
        }
      },
    }
  });
}