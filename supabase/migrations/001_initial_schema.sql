-- Pile Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
-- Links to Supabase Auth users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own record
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  original_file_path TEXT NOT NULL,
  modified_file_path TEXT,
  page_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Users can only see their own plans
CREATE POLICY "Users can view own plans"
ON plans FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own plans
CREATE POLICY "Users can insert own plans"
ON plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own plans
CREATE POLICY "Users can update own plans"
ON plans FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own plans
CREATE POLICY "Users can delete own plans"
ON plans FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- PILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS piles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,

  -- Position (percentage of page dimensions)
  x_percent FLOAT NOT NULL CHECK (x_percent >= 0 AND x_percent <= 100),
  y_percent FLOAT NOT NULL CHECK (y_percent >= 0 AND y_percent <= 100),
  page_number INTEGER NOT NULL DEFAULT 1 CHECK (page_number > 0),

  -- Visual
  color TEXT NOT NULL DEFAULT '#EF4444' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),

  -- Pile Attributes
  pile_installed BOOLEAN,
  date_installed DATE,
  as_built_available BOOLEAN,
  exceeded_tolerance BOOLEAN,
  ncr BOOLEAN,
  repairs BOOLEAN,
  engineer_review BOOLEAN,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_piles_plan_id ON piles(plan_id);

-- Enable RLS
ALTER TABLE piles ENABLE ROW LEVEL SECURITY;

-- Users can only access piles on their own plans
CREATE POLICY "Users can view piles on own plans"
ON piles FOR SELECT
USING (
  plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert piles on own plans"
ON piles FOR INSERT
WITH CHECK (
  plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update piles on own plans"
ON piles FOR UPDATE
USING (
  plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete piles on own plans"
ON piles FOR DELETE
USING (
  plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid())
);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER piles_updated_at
  BEFORE UPDATE ON piles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: Auto-create user profile
-- ============================================
-- Automatically creates a user record when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Note: Run these in the Supabase Dashboard > Storage

-- 1. Create a bucket named "plans" (public: false)
-- 2. Add these storage policies:

-- Policy: Users can upload files to their own folder
-- Name: "Users can upload own files"
-- Allowed operation: INSERT
-- Policy definition:
--   (bucket_id = 'plans') AND (auth.uid()::text = (storage.foldername(name))[1])

-- Policy: Users can read their own files
-- Name: "Users can read own files"
-- Allowed operation: SELECT
-- Policy definition:
--   (bucket_id = 'plans') AND (auth.uid()::text = (storage.foldername(name))[1])

-- Policy: Users can delete their own files
-- Name: "Users can delete own files"
-- Allowed operation: DELETE
-- Policy definition:
--   (bucket_id = 'plans') AND (auth.uid()::text = (storage.foldername(name))[1])
