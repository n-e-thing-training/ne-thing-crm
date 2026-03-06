import { createClient } from "@supabase/supabase-js";
import { optionalEnv, requireEnv } from "@/lib/env";

export function createAdminClient() {
  const serviceRoleKey = optionalEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations");
  }

  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
