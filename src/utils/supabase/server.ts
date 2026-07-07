import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "~/env";

// Privileged service-role client. Better-Auth owns identity/cookies, so this
// client is stateless; row-level authorization happens in tRPC procedures and
// server components, never in the database via RLS.
// Untyped (no Database generic): the generated types in ~/types/supabase
// predate the instagram_media and Better-Auth tables, which the generic would
// collapse to `never`.
let client: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  client ??= createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return client;
}
