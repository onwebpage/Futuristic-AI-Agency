-- ============================================================================
-- Complete BPO Withdrawal Setup for aliyaanmohd42@gmail.com
-- Run this entire script in your Supabase SQL Editor
-- ============================================================================

-- Step 1: Update user profile for COMPLETE BPO access
UPDATE profiles 
SET 
    account_type = 'BPO',
    bpo_status = 'APPROVED',
    is_active = true,
    selected_plan = 'bpo-enterprise',
    approved_at = NOW(),
    updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com'
RETURNING 
    id, 
    email, 
    full_name,
    account_type, 
    bpo_status, 
    selected_plan,
    is_active;

-- Step 2: Create/verify a PAID BPO purchase record
DO $$
DECLARE
    v_user_id UUID;
    v_purchase_exists INTEGER;
BEGIN
    -- Get user ID
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'aliyaanmohd42@gmail.com';
    
    -- Check if purchase exists
    SELECT COUNT(*) INTO v_purchase_exists
    FROM purchases
    WHERE user_id = v_user_id
    AND package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')
    AND status = 'PAID';
    
    -- Create purchase if it doesn't exist
    IF v_purchase_exists = 0 THEN
        INSERT INTO purchases (
            user_id,
            package_id,
            package_name,
            paypal_order_id,
            paypal_capture_id,
            amount,
            currency,
            status,
            purchased_at,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            'bpo-enterprise',
            'Enterprise BPO',
            'MANUAL_BPO_ENT_' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 12)),
            'CAPTURE_' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 16)),
            8000.00,
            'USD',
            'PAID',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'BPO Enterprise purchase record created';
    ELSE
        RAISE NOTICE 'BPO purchase already exists';
    END IF;
END $$;

-- Step 3: Create/update wallet with test balance for withdrawals
DO $$
DECLARE
    v_user_id UUID;
    v_wallet_exists INTEGER;
BEGIN
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'aliyaanmohd42@gmail.com';
    
    -- Check if wallet exists
    SELECT COUNT(*) INTO v_wallet_exists
    FROM wallets
    WHERE user_id = v_user_id;
    
    IF v_wallet_exists = 0 THEN
        -- Create new wallet
        INSERT INTO wallets (
            user_id, 
            balance, 
            pending_balance, 
            currency, 
            is_locked,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            1000.00,
            0.00,
            'USD',
            false,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Wallet created with $1000 balance';
    ELSE
        -- Update existing wallet
        UPDATE wallets 
        SET 
            balance = GREATEST(balance, 1000.00), -- Keep existing if higher
            is_locked = false,
            updated_at = NOW()
        WHERE user_id = v_user_id;
        RAISE NOTICE 'Wallet updated';
    END IF;
END $$;

-- Step 4: Add initial wallet transaction for the balance
DO $$
DECLARE
    v_user_id UUID;
    v_wallet_id BIGINT;
BEGIN
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'aliyaanmohd42@gmail.com';
    
    SELECT id INTO v_wallet_id
    FROM wallets
    WHERE user_id = v_user_id;
    
    -- Add a deposit transaction if none exists
    IF NOT EXISTS (
        SELECT 1 FROM wallet_transactions 
        WHERE user_id = v_user_id AND type = 'deposit'
    ) THEN
        INSERT INTO wallet_transactions (
            wallet_id,
            user_id,
            type,
            amount,
            fee,
            status,
            description,
            reference_id,
            created_at
        ) VALUES (
            v_wallet_id,
            v_user_id,
            'deposit',
            1000.00,
            0.00,
            'completed',
            'Initial wallet funding for BPO enterprise account',
            'INIT_' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 12)),
            NOW()
        );
        RAISE NOTICE 'Initial wallet transaction created';
    END IF;
END $$;

-- Step 5: Enable required modules
INSERT INTO module_settings (module_key, enabled, created_at, updated_at)
VALUES 
    ('bpo_withdrawals', true, NOW(), NOW()),
    ('wallet', true, NOW(), NOW())
ON CONFLICT (module_key) 
DO UPDATE SET 
    enabled = true,
    updated_at = NOW();

-- Step 6: Log the BPO access grant in audit logs
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = 'aliyaanmohd42@gmail.com';
    
    INSERT INTO audit_logs (
        action,
        entity_type,
        entity_id,
        metadata,
        created_at
    ) VALUES (
        'bpo_access_granted',
        'user_profile',
        v_user_id::TEXT,
        jsonb_build_object(
            'email', 'aliyaanmohd42@gmail.com',
            'plan', 'bpo-enterprise',
            'withdrawal_access', true,
            'granted_by', 'admin_sql_script',
            'timestamp', NOW()
        ),
        NOW()
    );
END $$;

-- ============================================================================
-- VERIFICATION: Check that everything is set up correctly
-- ============================================================================

SELECT 
    '=== USER PROFILE ===' as section,
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.account_type,
    p.bpo_status,
    p.selected_plan,
    p.is_active,
    p.approved_at
FROM profiles p
WHERE p.email = 'aliyaanmohd42@gmail.com'

UNION ALL

SELECT 
    '=== WALLET ===' as section,
    w.id::TEXT,
    w.user_id::TEXT,
    NULL,
    NULL,
    w.balance::TEXT,
    w.pending_balance::TEXT,
    w.currency,
    w.is_locked::TEXT,
    w.updated_at
FROM wallets w
WHERE w.user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com')

UNION ALL

SELECT 
    '=== BPO PURCHASES ===' as section,
    pur.id::TEXT,
    pur.package_id,
    pur.package_name,
    pur.status,
    pur.amount::TEXT,
    pur.currency,
    NULL,
    NULL,
    pur.purchased_at
FROM purchases pur
WHERE pur.user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com')
AND pur.package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')

UNION ALL

SELECT 
    '=== MODULES ===' as section,
    ms.module_key,
    ms.enabled::TEXT,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    ms.updated_at
FROM module_settings ms
WHERE ms.module_key IN ('bpo_withdrawals', 'wallet');

-- ============================================================================
-- SUMMARY CHECK
-- ============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_has_profile BOOLEAN;
    v_has_bpo_access BOOLEAN;
    v_has_purchase BOOLEAN;
    v_has_wallet BOOLEAN;
    v_wallet_balance NUMERIC;
    v_modules_enabled BOOLEAN;
BEGIN
    -- Check user profile
    SELECT id INTO v_user_id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com';
    v_has_profile := v_user_id IS NOT NULL;
    
    -- Check BPO access
    SELECT 
        account_type = 'BPO' 
        AND bpo_status = 'APPROVED' 
        AND is_active = true
        AND selected_plan IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')
    INTO v_has_bpo_access
    FROM profiles 
    WHERE id = v_user_id;
    
    -- Check purchase
    SELECT EXISTS(
        SELECT 1 FROM purchases
        WHERE user_id = v_user_id
        AND package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')
        AND status = 'PAID'
    ) INTO v_has_purchase;
    
    -- Check wallet
    SELECT balance INTO v_wallet_balance
    FROM wallets
    WHERE user_id = v_user_id;
    v_has_wallet := v_wallet_balance IS NOT NULL;
    
    -- Check modules
    SELECT 
        COUNT(*) = 2 
        AND SUM(CASE WHEN enabled THEN 1 ELSE 0 END) = 2
    INTO v_modules_enabled
    FROM module_settings
    WHERE module_key IN ('bpo_withdrawals', 'wallet');
    
    -- Print summary
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'BPO WITHDRAWAL SETUP VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'User Email: aliyaanmohd42@gmail.com';
    RAISE NOTICE '✓ Profile exists: %', CASE WHEN v_has_profile THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '✓ BPO Access granted: %', CASE WHEN v_has_bpo_access THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '✓ BPO Purchase (PAID): %', CASE WHEN v_has_purchase THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '✓ Wallet exists: %', CASE WHEN v_has_wallet THEN '✓ YES ($' || v_wallet_balance || ')' ELSE '✗ NO' END;
    RAISE NOTICE '✓ Modules enabled: %', CASE WHEN v_modules_enabled THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '========================================';
    
    IF v_has_profile AND v_has_bpo_access AND v_has_purchase AND v_has_wallet AND v_modules_enabled THEN
        RAISE NOTICE '✓✓✓ ALL CHECKS PASSED ✓✓✓';
        RAISE NOTICE 'User can now access BPO Withdrawals!';
    ELSE
        RAISE WARNING '✗✗✗ SOME CHECKS FAILED ✗✗✗';
        RAISE WARNING 'Please review the output above';
    END IF;
    RAISE NOTICE '========================================';
END $$;
