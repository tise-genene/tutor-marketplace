-- Better Auth Database Tables
-- Run this in Supabase SQL Editor to create Better Auth tables

-- User table (Better Auth's user table - separate from your app's users table)
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session table
CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- Account table (for OAuth providers)
CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMP WITH TIME ZONE,
  refresh_token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, account_id)
);

-- Verification table (for email verification, password reset, etc.)
CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth Account table (if using OAuth)
CREATE TABLE IF NOT EXISTS "oauth_account" (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- OAuth Client table (if using OAuth)
CREATE TABLE IF NOT EXISTS "oauth_client" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  client_id TEXT UNIQUE NOT NULL,
  client_secret TEXT,
  redirect_uris TEXT[],
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session"(user_id);
CREATE INDEX IF NOT EXISTS "session_token_idx" ON "session"(token);
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account"(user_id);
CREATE INDEX IF NOT EXISTS "account_provider_id_idx" ON "account"(provider_id, account_id);
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"(identifier);
CREATE INDEX IF NOT EXISTS "verification_value_idx" ON "verification"(value);
CREATE INDEX IF NOT EXISTS "oauth_account_user_id_idx" ON "oauth_account"(user_id);
CREATE INDEX IF NOT EXISTS "oauth_account_provider_idx" ON "oauth_account"(provider, provider_user_id);

-- Enable Row Level Security (RLS) on Better Auth tables
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "oauth_client" ENABLE ROW LEVEL SECURITY;

-- Note: Better Auth will manage its own RLS policies, but you can add custom ones if needed

