-- =====================================================
-- Migration 5.02 — ROLLBACK for 01_lock_down_client_roles.sql
-- =====================================================
-- Restores PostgREST client-role access as it was before migration 5.
-- WARNING: this restores the previous *insecure* state — the placeholder
-- USING (true) policies from migrations 2/04 and 3/01 grant any anon-key
-- holder full read/write on these tables. Use only if client-side Supabase
-- access must be temporarily restored.

BEGIN;

-- 1) Restore role grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES    IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;

-- 2) Recreate the pre-migration placeholder policies
CREATE POLICY "Users can view their own profile" ON "user"
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON "user"
    FOR UPDATE USING (true);
CREATE POLICY "Users can view commissions" ON commissions
    FOR SELECT USING (true);
CREATE POLICY "Users can insert their own commissions" ON commissions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own commissions" ON commissions
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own commissions" ON commissions
    FOR DELETE USING (true);
CREATE POLICY "Users can view messages" ON messages
    FOR SELECT USING (true);
CREATE POLICY "Users can insert messages" ON messages
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (true);
CREATE POLICY "Admin can manage instagram media" ON instagram_media
    FOR ALL USING (true);

-- 3) RLS was already enabled on user/commissions/messages/profile_measurements/
--    instagram_media before migration 5; leave it enabled. Tables that only
--    gained RLS in migration 5 keep it (harmless with the grants above given
--    the permissive policies, and Better-Auth uses the pg Pool regardless).

COMMIT;
