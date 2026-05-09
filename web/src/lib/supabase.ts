import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY must be set."
  );
}

// Singleton for browser-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function createSupabaseClient() {
  if (typeof window !== "undefined") {
    browserClient ??= createClient(supabaseUrl, supabaseAnonKey);
    return browserClient;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Server-side client using the service role key (only available in server context)
export function createSupabaseServerClient() {
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. This function must only be called in server-side code."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
