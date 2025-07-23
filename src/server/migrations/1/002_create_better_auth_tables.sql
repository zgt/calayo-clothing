-- Migration: Create better-auth database tables
-- This creates the standard better-auth schema for user authentication

-- Users table for better-auth
CREATE TABLE IF NOT EXISTS public.user (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
    name TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    image TEXT,
    -- Additional fields to maintain compatibility with Supabase structure
    email_confirmed_at TIMESTAMP NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'))
);

-- Accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS public.account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt TIMESTAMP,
    refreshTokenExpiresAt TIMESTAMP,
    scope TEXT,
    password TEXT,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS public.session (
    id TEXT PRIMARY KEY,
    expiresAt TIMESTAMP NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE
);

-- Verification tokens table
CREATE TABLE IF NOT EXISTS public.verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Password reset tokens table  
CREATE TABLE IF NOT EXISTS public.passwordReset (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_email ON public.user(email);
CREATE INDEX IF NOT EXISTS idx_account_userId ON public.account(userId);
CREATE INDEX IF NOT EXISTS idx_account_providerId ON public.account(providerId);
CREATE INDEX IF NOT EXISTS idx_session_userId ON public.session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON public.session(token);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON public.verification(identifier);
CREATE INDEX IF NOT EXISTS idx_passwordReset_userId ON public.passwordReset(userId);
CREATE INDEX IF NOT EXISTS idx_passwordReset_token ON public.passwordReset(token);

-- Add comments
COMMENT ON TABLE public.user IS 'Better-auth users table';
COMMENT ON TABLE public.account IS 'Better-auth accounts table for OAuth providers';
COMMENT ON TABLE public.session IS 'Better-auth sessions table';
COMMENT ON TABLE public.verification IS 'Better-auth verification tokens table';
COMMENT ON TABLE public.passwordReset IS 'Better-auth password reset tokens table';