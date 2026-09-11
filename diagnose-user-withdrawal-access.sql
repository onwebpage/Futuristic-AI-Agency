-- Diagnostic SQL: Check why withdrawals aren't showing
-- Run this in Supabase SQL Editor

-- Step 1: Check user profile data
SELECT 
    '=== USER PROFILE DATA ===' as check_name,
    id,
    email,
    full_name,
    role,
    account_type,
    bpo_status,
    selected_plan,
    is_active,
    created_at
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com';

-- Step 2: Check if user has BPO purchases
SELECT 
    '=== BPO PURCHASES ===' as check_name,
    id,
    user_id,
    package_id,
    package_name,
    status,
    amount,
    currency,
    purchased_at
FROM purchases 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com')
AND package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise');

-- Step 3: Check module settings
SELECT 
    '=== MODULE SETTINGS ===' as check_name,
    module_key,
    enabled
FROM module_settings 
WHERE module_key IN ('bpo_withdrawals', 'wallet')
ORDER BY module_key;

-- Step 4: Check wallet
SELECT 
    '=== WALLET DATA ===' as check_name,
    id,
    user_id,
    balance,
    pending_balance,
    currency,
    is_locked
FROM wallets 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com');

-- Step 5: DIAGNOSIS - What's preventing access?
DO $$
DECLARE
    v_user_id UUID;
    v_role TEXT;
    v_account_type TEXT;
    v_bpo_status TEXT;
    v_selected_plan TEXT;
    v_is_active BOOLEAN;
    v_has_bpo_purchase BOOLEAN;
    v_bpo_withdrawals_enabled BOOLEAN;
    v_wallet_enabled BOOLEAN;
    v_has_wallet BOOLEAN;
BEGIN
    -- Get user data
    SELECT id, role, account_type, bpo_status, selected_plan, is_active
    INTO v_user_id, v_role, v_account_type, v_bpo_status, v_selected_plan, v_is_active
    FROM profiles 
    WHERE email = 'aliyaanmohd42@gmail.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE '❌ USER NOT FOUND';
        RETURN;
    END IF;
    
    -- Check BPO purchase
    SELECT EXISTS(
        SELECT 1 FROM purchases
        WHERE user_id = v_user_id
        AND package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')
        AND status = 'PAID'
    ) INTO v_has_bpo_purchase;
    
    -- Check modules
    SELECT 
        COALESCE(MAX(CASE WHEN module_key = 'bpo_withdrawals' THEN enabled END), false),
        COALESCE(MAX(CASE WHEN module_key = 'wallet' THEN enabled END), false)
    INTO v_bpo_withdrawals_enabled, v_wallet_enabled
    FROM module_settings
    WHERE module_key IN ('bpo_withdrawals', 'wallet');
    
    -- Check wallet
    SELECT EXISTS(
        SELECT 1 FROM wallets WHERE user_id = v_user_id
    ) INTO v_has_wallet;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'WITHDRAWAL ACCESS DIAGNOSIS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'User: aliyaanmohd42@gmail.com';
    RAISE NOTICE '';
    
    -- Frontend checks (from UserDashboardPage.tsx line 391)
    RAISE NOTICE '--- FRONTEND ELIGIBILITY CHECK ---';
    RAISE NOTICE 'Role: %', COALESCE(v_role, 'NULL');
    RAISE NOTICE '  ├─ Is partner? %', CASE WHEN v_role = 'partner' THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '  ├─ Is bpo_partner? %', CASE WHEN v_role = 'bpo_partner' THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '';
    RAISE NOTICE 'Selected Plan: %', COALESCE(v_selected_plan, 'NULL');
    RAISE NOTICE '  ├─ Is bpo-starter? %', CASE WHEN v_selected_plan = 'bpo-starter' THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '  ├─ Is bpo-growth? %', CASE WHEN v_selected_plan = 'bpo-growth' THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '  └─ Is bpo-enterprise? %', CASE WHEN v_selected_plan = 'bpo-enterprise' THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '';
    RAISE NOTICE 'Frontend mayUseBpoWithdrawals: %', 
        CASE 
            WHEN v_role IN ('partner', 'bpo_partner') THEN '✓ TRUE (via role)'
            WHEN v_selected_plan IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise') THEN '✓ TRUE (via plan)'
            ELSE '✗ FALSE'
        END;
    RAISE NOTICE '';
    
    -- Backend checks (requireBpoWithdrawal middleware)
    RAISE NOTICE '--- BACKEND ELIGIBILITY CHECK ---';
    RAISE NOTICE 'Has PAID BPO Purchase: %', CASE WHEN v_has_bpo_purchase THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '';
    
    -- Module checks
    RAISE NOTICE '--- MODULE CHECKS ---';
    RAISE NOTICE 'bpo_withdrawals enabled: %', CASE WHEN v_bpo_withdrawals_enabled THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE 'wallet enabled: %', CASE WHEN v_wallet_enabled THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '';
    
    -- Other checks
    RAISE NOTICE '--- OTHER CHECKS ---';
    RAISE NOTICE 'Account Active: %', CASE WHEN v_is_active THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE 'Account Type: %', COALESCE(v_account_type, 'NULL');
    RAISE NOTICE 'BPO Status: %', COALESCE(v_bpo_status, 'NULL');
    RAISE NOTICE 'Has Wallet: %', CASE WHEN v_has_wallet THEN '✓ YES' ELSE '✗ NO' END;
    RAISE NOTICE '';
    
    -- Final verdict
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERDICT:';
    RAISE NOTICE '========================================';
    
    IF v_role IN ('partner', 'bpo_partner') OR v_selected_plan IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise') THEN
        RAISE NOTICE '✓ Frontend SHOULD show BPO Withdrawals tab';
    ELSE
        RAISE NOTICE '✗ Frontend will NOT show BPO Withdrawals tab';
        RAISE NOTICE '   Reason: Role is not partner/bpo_partner AND';
        RAISE NOTICE '           selected_plan is not a BPO plan';
    END IF;
    
    IF v_has_bpo_purchase THEN
        RAISE NOTICE '✓ Backend WILL allow withdrawal API access';
    ELSE
        RAISE NOTICE '✗ Backend will DENY withdrawal API access';
        RAISE NOTICE '   Reason: No PAID BPO purchase found';
    END IF;
    
    IF v_bpo_withdrawals_enabled AND v_wallet_enabled THEN
        RAISE NOTICE '✓ Modules are enabled';
    ELSE
        RAISE NOTICE '✗ Required modules are disabled';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RECOMMENDED FIXES:';
    RAISE NOTICE '========================================';
    
    IF v_role NOT IN ('partner', 'bpo_partner') AND v_selected_plan NOT IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise') THEN
        RAISE NOTICE '1. Set selected_plan to bpo-enterprise:';
        RAISE NOTICE '   UPDATE profiles SET selected_plan = ''bpo-enterprise'' WHERE email = ''aliyaanmohd42@gmail.com'';';
    END IF;
    
    IF NOT v_has_bpo_purchase THEN
        RAISE NOTICE '2. Create PAID BPO purchase record (see enable-bpo-withdrawal-complete.sql)';
    END IF;
    
    IF NOT v_bpo_withdrawals_enabled OR NOT v_wallet_enabled THEN
        RAISE NOTICE '3. Enable modules:';
        RAISE NOTICE '   INSERT INTO module_settings (module_key, enabled) VALUES (''bpo_withdrawals'', true), (''wallet'', true)';
        RAISE NOTICE '   ON CONFLICT (module_key) DO UPDATE SET enabled = true;';
    END IF;
    
    IF NOT v_has_wallet THEN
        RAISE NOTICE '4. Create wallet (run enable-bpo-withdrawal-complete.sql)';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
