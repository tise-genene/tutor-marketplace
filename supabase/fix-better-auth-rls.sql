-- Fix Better Auth RLS policies
-- Better Auth needs to be able to query its own tables
-- Run this in Supabase SQL Editor

-- Disable RLS on Better Auth tables (Better Auth manages its own security)
-- OR add permissive policies for service role

-- Option 1: Disable RLS (Better Auth handles security internally)
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "session" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_account" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_client" DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, add permissive policies
-- (Uncomment if you prefer RLS over disabling it)

-- Allow service role to do everything
-- CREATE POLICY "service_role_all" ON "user" FOR ALL USING (auth.role() = 'service_role');
-- CREATE POLICY "service_role_all" ON "session" FOR ALL USING (auth.role() = 'service_role');
-- CREATE POLICY "service_role_all" ON "account" FOR ALL USING (auth.role() = 'service_role');
-- CREATE POLICY "service_role_all" ON "verification" FOR ALL USING (auth.role() = 'service_role');
-- CREATE POLICY "service_role_all" ON "oauth_account" FOR ALL USING (auth.role() = 'service_role');
-- CREATE POLICY "service_role_all" ON "oauth_client" FOR ALL USING (auth.role() = 'service_role');

-- Note: Better Auth uses the DATABASE_URL which connects as postgres user
-- The postgres user should have full access, but RLS might be blocking it
-- Disabling RLS is the simplest solution for Better Auth tables

