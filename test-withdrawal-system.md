# BPO Withdrawal System - Complete Test Guide

## System Overview

The withdrawal system is **already fully implemented** with proper BPO plan validation. Here's how it works:

### ✅ What's Already Implemented:

1. **Backend Validation** (`artifacts/api-server/src/routes/user.ts`):
   - `requireBpoWithdrawal()` middleware validates BPO plan purchases
   - Checks if user has paid for any BPO plan: `bpo-starter`, `bpo-growth`, or `bpo-enterprise`
   - All withdrawal endpoints are protected with this middleware

2. **Frontend Access Control** (`artifacts/thinkatic/src/pages/UserDashboardPage.tsx`):
   - Checks if user has BPO role OR has purchased a BPO plan
   - Only shows "BPO Withdrawals" tab if eligible
   - Line 391: `mayUseBpoWithdrawals = pData.role === "partner" || pData.role === "bpo_partner" || BPO_PLAN_IDS.has(pData.selectedPlan || "");`

3. **Database Validation** (`lib/db/src/index.ts`):
   - `hasPaidBpo()` function checks purchases table
   - Verifies status is "PAID" and package_id is a BPO plan

---

## How It Works

### Step 1: User Must Have BPO Plan
Users can access withdrawals ONLY if:
- They have `role = 'partner'` or `role = 'bpo_partner'`, OR
- They have purchased a BPO plan (`bpo-starter`, `bpo-growth`, or `bpo-enterprise`) with status = 'PAID', OR
- They have `selected_plan` set to a BPO plan ID

### Step 2: Backend Validates Every Request
All withdrawal-related endpoints check:
```
GET  /user/withdrawals/access       → requireBpoWithdrawal
GET  /user/payout-details           → requireBpoWithdrawal
POST /user/payout-details           → requireBpoWithdrawal
GET  /user/withdrawals              → requireBpoWithdrawal
POST /user/withdrawals              → requireBpoWithdrawal
```

### Step 3: Withdrawal Flow
1. User adds payout method (PayPal or Indian Bank)
2. User requests withdrawal with amount and payout method
3. System validates:
   - User has BPO plan
   - Sufficient wallet balance
   - No pending withdrawal already exists
   - Amount meets minimum ($50 by default)
4. Withdrawal created with status "PENDING"
5. Admin reviews and approves/rejects
6. Funds released or returned to wallet

---

## Testing the System

### Test 1: Verify User Has BPO Access

**SQL Query to Check User Status:**
```sql
SELECT 
    id,
    email,
    full_name,
    role,
    account_type,
    bpo_status,
    selected_plan,
    is_active
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com';
```

**Expected Result for BPO Access:**
- `account_type` = 'BPO'
- `bpo_status` = 'APPROVED'
- `selected_plan` = 'bpo-enterprise' (or 'bpo-starter' or 'bpo-growth')
- `is_active` = true

**If not set, run this SQL:**
```sql
UPDATE profiles 
SET 
    account_type = 'BPO',
    bpo_status = 'APPROVED',
    is_active = true,
    selected_plan = 'bpo-enterprise',
    approved_at = NOW(),
    updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com';
```

### Test 2: Verify Purchase Record (Alternative Method)

**SQL Query:**
```sql
SELECT 
    id,
    user_id,
    package_id,
    package_name,
    status,
    amount,
    purchased_at
FROM purchases 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com')
AND package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')
AND status = 'PAID';
```

**If no purchase exists, create one:**
```sql
-- Get user ID first
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com';
    
    -- Insert a purchase record
    INSERT INTO purchases (
        user_id,
        package_id,
        package_name,
        paypal_order_id,
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
        'MANUAL_' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 16)),
        8000.00,
        'USD',
        'PAID',
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING;
END $$;
```

### Test 3: Verify Wallet Exists

**SQL Query:**
```sql
SELECT 
    id,
    user_id,
    balance,
    pending_balance,
    currency,
    is_locked
FROM wallets 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com');
```

**If wallet doesn't exist, create it:**
```sql
INSERT INTO wallets (user_id, balance, pending_balance, currency, is_locked)
SELECT id, 1000.00, 0.00, 'USD', false
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
```

### Test 4: Check Module Settings

**SQL Query:**
```sql
SELECT module_key, enabled 
FROM module_settings 
WHERE module_key IN ('bpo_withdrawals', 'wallet');
```

**If not enabled, enable them:**
```sql
INSERT INTO module_settings (module_key, enabled)
VALUES 
    ('bpo_withdrawals', true),
    ('wallet', true)
ON CONFLICT (module_key) 
DO UPDATE SET enabled = true;
```

---

## Frontend Testing Steps

### Step 1: Login to User Dashboard
1. Go to your Thinkatic user dashboard
2. Login with: `aliyaanmohd42@gmail.com`

### Step 2: Verify "BPO Withdrawals" Tab Appears
- After login, check the left sidebar
- You should see a tab labeled "**BPO Withdrawals**" with a wallet icon
- The tab should show your wallet balance (e.g., "**$1000**")

### Step 3: Add a Payout Method
1. Click on "BPO Withdrawals" tab
2. Scroll to "Add payout method" section
3. Choose PayPal or Indian Bank
4. Fill in details:
   - **PayPal**: Enter email address
   - **Indian Bank**: Enter account holder name, bank name, account number, IFSC code, account type
5. Click "Save payout method"

### Step 4: Request a Withdrawal
1. Click "Request Payout / Withdrawal" button
2. Enter withdrawal amount (minimum $50)
3. Select saved payout method
4. Click "Submit withdrawal request"
5. You should see success message: "Withdrawal request submitted for admin review"

### Step 5: View Withdrawal History
- Scroll to "Withdrawal history" section
- You should see your withdrawal request with status "PENDING"

---

## Admin Testing Steps

### Admin Approval Process

1. **Login to Admin Panel** (`/admin`)
2. **Navigate to Withdrawals** section
3. **View pending withdrawal requests**
4. **Approve or Reject** the withdrawal

**SQL to Manually Approve:**
```sql
-- View pending withdrawals
SELECT id, user_id, amount, method, status 
FROM withdrawals 
WHERE status = 'PENDING'
ORDER BY created_at DESC;

-- Approve a withdrawal (replace ID)
UPDATE withdrawals 
SET 
    status = 'APPROVED',
    reviewed_at = NOW(),
    updated_at = NOW()
WHERE id = <withdrawal_id>;

-- Update wallet (deduct from pending, funds already removed)
UPDATE wallets 
SET 
    pending_balance = pending_balance - <amount>,
    updated_at = NOW()
WHERE user_id = (SELECT user_id FROM withdrawals WHERE id = <withdrawal_id>);
```

---

## Error Scenarios to Test

### Test: User WITHOUT BPO Plan
1. Create a regular user (no BPO plan)
2. Login to dashboard
3. **Expected**: "BPO Withdrawals" tab should NOT appear
4. **Test API directly**:
   ```bash
   curl -X GET https://your-domain.com/api/user/withdrawals/access \
     -H "Authorization: Bearer <user_token>"
   ```
5. **Expected Response**: `403 Forbidden - "BPO purchase required for withdrawal access"`

### Test: Insufficient Balance
1. Set wallet balance to $10
2. Try to withdraw $100
3. **Expected Error**: "Insufficient wallet balance"

### Test: Below Minimum Amount
1. Try to withdraw $20 (minimum is $50)
2. **Expected Error**: "Minimum withdrawal amount is 50.00"

### Test: Already Pending Withdrawal
1. Create a pending withdrawal
2. Try to create another one
3. **Expected Error**: "A withdrawal is already pending"

---

## Complete SQL Setup Script

Run this to ensure user has full BPO withdrawal access:

```sql
-- Step 1: Update user profile for BPO access
UPDATE profiles 
SET 
    account_type = 'BPO',
    bpo_status = 'APPROVED',
    is_active = true,
    selected_plan = 'bpo-enterprise',
    approved_at = NOW(),
    updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com';

-- Step 2: Create/verify purchase record
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com';
    
    INSERT INTO purchases (
        user_id,
        package_id,
        package_name,
        paypal_order_id,
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
        8000.00,
        'USD',
        'PAID',
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING;
END $$;

-- Step 3: Create/update wallet with test balance
INSERT INTO wallets (user_id, balance, pending_balance, currency, is_locked)
SELECT id, 1000.00, 0.00, 'USD', false
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
    balance = 1000.00,
    updated_at = NOW();

-- Step 4: Enable withdrawal module
INSERT INTO module_settings (module_key, enabled)
VALUES 
    ('bpo_withdrawals', true),
    ('wallet', true)
ON CONFLICT (module_key) 
DO UPDATE SET enabled = true;

-- Step 5: Verify everything is set up
SELECT 
    p.email,
    p.account_type,
    p.bpo_status,
    p.selected_plan,
    p.is_active,
    w.balance as wallet_balance,
    COUNT(pur.id) as bpo_purchases
FROM profiles p
LEFT JOIN wallets w ON w.user_id = p.id
LEFT JOIN purchases pur ON pur.user_id = p.id 
    AND pur.package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')
    AND pur.status = 'PAID'
WHERE p.email = 'aliyaanmohd42@gmail.com'
GROUP BY p.id, p.email, p.account_type, p.bpo_status, p.selected_plan, p.is_active, w.balance;
```

---

## Environment Variables

Ensure your `.env` file has:

```env
# Minimum withdrawal amount (default: 50)
MIN_WITHDRAWAL_AMOUNT=50

# Encryption key for payout details (uses SESSION_SECRET if not set)
WITHDRAWAL_ENCRYPTION_KEY=your_secure_encryption_key_here

# Session secret for JWT
SESSION_SECRET=your_secure_admin_session_secret_here
```

---

## Summary

✅ **The withdrawal system is fully functional and properly validates BPO plan access.**

### Key Points:
1. ✅ Backend validates BPO purchase on every withdrawal request
2. ✅ Frontend only shows withdrawal tab to BPO plan holders
3. ✅ Database checks for PAID BPO purchases
4. ✅ Complete withdrawal flow: request → admin review → approval/rejection
5. ✅ Wallet balance tracking with pending balance during review
6. ✅ Support for PayPal and Indian bank accounts

### To Enable for User:
Run the "Complete SQL Setup Script" above in your Supabase SQL Editor, then refresh the dashboard.

The user `aliyaanmohd42@gmail.com` will immediately have:
- ✅ BPO Enterprise plan access
- ✅ Withdrawal tab visible
- ✅ $1000 wallet balance for testing
- ✅ Full withdrawal functionality
