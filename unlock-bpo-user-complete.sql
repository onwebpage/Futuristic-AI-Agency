-- Complete SQL Script to unlock ALL BPO access for aliyaanmohd42@gmail.com
-- Run this in your Supabase SQL Editor

-- Step 1: Add BPO columns if they don't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT NOT NULL DEFAULT 'USER',
  ADD COLUMN IF NOT EXISTS bpo_status TEXT NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS bpo_application_details JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Step 2: Add constraints
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_account_type_check,
  DROP CONSTRAINT IF EXISTS profiles_bpo_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_account_type_check CHECK (account_type IN ('USER', 'BPO')),
  ADD CONSTRAINT profiles_bpo_status_check CHECK (bpo_status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_bpo_status ON public.profiles(bpo_status);

-- Step 4: Unlock COMPLETE BPO access with Enterprise plan (highest tier)
UPDATE profiles 
SET 
    account_type = 'BPO',
    bpo_status = 'APPROVED',
    is_active = true,
    selected_plan = 'bpo-enterprise',  -- This is the key! Sets the BPO Enterprise plan
    approved_at = NOW(),
    updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com'
RETURNING 
    id, 
    email, 
    full_name,
    account_type, 
    bpo_status, 
    is_active, 
    selected_plan,
    approved_at;

-- Step 5: Verify the complete changes
SELECT 
    id,
    email,
    full_name,
    role,
    account_type,
    bpo_status,
    is_active,
    selected_plan,
    approved_at,
    updated_at
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com';
