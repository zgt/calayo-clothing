-- =====================================================
-- Migration 5.01 — Lock PostgREST client roles out
-- =====================================================
-- The app now performs every database operation server-side as service_role
-- (tRPC / server components) or through the direct pg Pool (Better-Auth).
-- The public anon key is no longer used by any client code, so anon and
-- authenticated lose all access. This closes direct Supabase REST access to
-- every table — including the Better-Auth tables, whose session tokens were
-- previously readable with the anon key.
--
-- APPLY ONLY AFTER the app is deployed with SUPABASE_SERVICE_ROLE_KEY set
-- (the service-role/tRPC-chat changes). service_role bypasses RLS and keeps
-- its own grants, so the app is unaffected by this migration.
--
-- Before running, list any stray policies not covered below:
--   SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

BEGIN;

-- -----------------------------------------------------
-- 1) Drop the placeholder USING (true) policies
--    (created by migrations 2/04_cleanup.sql and 3/01)
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile"       ON "user";
DROP POLICY IF EXISTS "Users can update their own profile"     ON "user";
DROP POLICY IF EXISTS "Users can view commissions"             ON commissions;
DROP POLICY IF EXISTS "Users can insert their own commissions" ON commissions;
DROP POLICY IF EXISTS "Users can update their own commissions" ON commissions;
DROP POLICY IF EXISTS "Users can delete their own commissions" ON commissions;
DROP POLICY IF EXISTS "Users can view messages"                ON messages;
DROP POLICY IF EXISTS "Users can insert messages"              ON messages;
DROP POLICY IF EXISTS "Users can update their own messages"    ON messages;
DROP POLICY IF EXISTS "Users can delete their own messages"    ON messages;
DROP POLICY IF EXISTS "Admin can manage instagram media"       ON instagram_media;

-- -----------------------------------------------------
-- 2) RLS enabled with zero policies = deny for anon /
--    authenticated on every public table
-- -----------------------------------------------------
ALTER TABLE "user"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE account                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE session                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "passwordReset"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_measurements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_media         ENABLE ROW LEVEL SECURITY;

-- Leftover backup tables from migration set 2, if still present. (Consider
-- dropping them entirely once the migration is confirmed stable.)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename LIKE 'migration_backup_%'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- -----------------------------------------------------
-- 3) Belt and braces: revoke the grants PostgREST
--    relies on for the client roles
-- -----------------------------------------------------
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE USAGE ON SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES    FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

COMMIT;

-- =====================================================
-- Verification (run after applying)
-- =====================================================
-- 1) No client-facing policies remain:
--      SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
--    → zero rows.
-- 2) REST access is denied with the anon key:
--      curl "$SUPABASE_URL/rest/v1/messages?select=*" \
--        -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--    → 401/permission denied. Repeat for user, session, commissions,
--      profile_measurements, instagram_media.
-- 3) The app still works (sign-in, orders, chat, admin) — it uses
--    service_role and the pg Pool, which are unaffected.
