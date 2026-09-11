-- SQL Script to unlock BPO access for aliyaanmohd42@gmail.com
-- Run this in your Supabase SQL Editor

-- Step 1: Check current user status
SELECT 
    id,
    email,
    full_name,
    account_type,
    bpo_status,
    is_active,
    approved_at
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com';

-- Step 2: Unlock BPO access
UPDATE profiles 
SET 
    account_type = 'BPO',
    bpo_status = 'APPROVED',
    is_active = true,
    approved_at = NOW(),
    updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com'
RETURNING id, email, account_type, bpo_status, is_active, approved_at;

-- Step 3: Log the action in audit logs
INSERT INTO audit_logs (
    action,
    entity_type,
    entity_id,
    metadata,
    created_at
)
SELECT
    'bpo_access_unlocked',
    'user_profile',
    id::text,
    jsonb_build_object(
        'email', email,
        'result', 'success',
        'unlocked_by', 'admin_sql_script',
        'timestamp', NOW()
    ),
    NOW()
FROM profiles
WHERE email = 'aliyaanmohd42@gmail.com';

-- Step 4: Verify the changes
SELECT 
    id,
    email,
    full_name,
    account_type,
    bpo_status,
    is_active,
    approved_at,
    updated_at
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com';
