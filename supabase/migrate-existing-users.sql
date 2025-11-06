-- Migration script to create Better Auth users for existing users
-- Run this in Supabase SQL Editor after creating Better Auth tables
-- This will sync existing users from the 'users' table to Better Auth's 'user' table

-- Insert Better Auth users for all existing users
INSERT INTO "user" (id, name, email, email_verified, created_at, updated_at)
SELECT 
  id::text,  -- Convert UUID to TEXT
  name,
  email,
  email_verified,
  created_at,
  updated_at
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM "user" WHERE "user".id = users.id::text
)
ON CONFLICT (id) DO NOTHING;

-- Insert Better Auth accounts with passwords for all existing users
-- Note: This assumes passwords are already hashed with bcrypt
INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at)
SELECT 
  (users.id::text || '-credential') as id,
  users.email as account_id,
  'credential' as provider_id,
  users.id::text as user_id,
  users.password,  -- Already hashed with bcrypt
  users.created_at,
  users.updated_at
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM "account" WHERE "account".user_id = users.id::text AND "account".provider_id = 'credential'
)
ON CONFLICT (provider_id, account_id) DO NOTHING;

-- Verify the migration
SELECT 
  'Total users in users table' as description,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'Total users in Better Auth user table' as description,
  COUNT(*) as count
FROM "user"
UNION ALL
SELECT 
  'Total Better Auth accounts' as description,
  COUNT(*) as count
FROM "account"
WHERE provider_id = 'credential';

