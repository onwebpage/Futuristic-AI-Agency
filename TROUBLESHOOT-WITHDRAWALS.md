# 🔧 Troubleshooting: BPO Withdrawals Not Showing

## ⚡ Quick Fix (Run This First!)

### **Step 1: Run the Emergency Fix SQL**
Open Supabase SQL Editor and run:
```
fix-withdrawal-access-NOW.sql
```

This script:
- ✅ Sets `role = 'bpo_partner'`
- ✅ Sets `selected_plan = 'bpo-enterprise'`
- ✅ Creates PAID purchase record
- ✅ Enables all modules
- ✅ Creates wallet with $1000

### **Step 2: Hard Refresh Browser**
- **Windows**: `Ctrl + F5` or `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### **Step 3: Check if Tab Appears**
Look for "**BPO Withdrawals**" in the left sidebar

---

## 🔍 Diagnostic Steps

### **Run Diagnostic SQL**
```
diagnose-user-withdrawal-access.sql
```

This will tell you exactly what's wrong and what to fix.

---

## 📋 Checklist - Why Tab Might Not Show

The frontend shows the tab ONLY if **at least ONE** of these is true:

### ✅ Frontend Checks (Line 391 of UserDashboardPage.tsx)
```typescript
mayUseBpoWithdrawals = 
    pData.role === "partner" ||           // Check 1
    pData.role === "bpo_partner" ||       // Check 2
    BPO_PLAN_IDS.has(pData.selectedPlan)  // Check 3
```

**Translation:**
1. User has role `'partner'`, OR
2. User has role `'bpo_partner'`, OR
3. User has `selected_plan` = one of: `'bpo-starter'`, `'bpo-growth'`, `'bpo-enterprise'`

### 🔍 Check Your User Data

Run this SQL:
```sql
SELECT 
    email,
    role,
    selected_plan,
    account_type,
    bpo_status,
    is_active
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com';
```

**Expected Result:**
- `role` = `'bpo_partner'` (or `'partner'`)
- `selected_plan` = `'bpo-enterprise'` (or `'bpo-starter'` or `'bpo-growth'`)
- `account_type` = `'BPO'`
- `bpo_status` = `'APPROVED'`
- `is_active` = `true`

---

## 🐛 Common Issues

### Issue 1: Role is Wrong
**Problem:** `role = 'user'` instead of `'bpo_partner'`

**Fix:**
```sql
UPDATE profiles 
SET role = 'bpo_partner', updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com';
```

### Issue 2: Selected Plan Not Set
**Problem:** `selected_plan = NULL` or not a BPO plan

**Fix:**
```sql
UPDATE profiles 
SET selected_plan = 'bpo-enterprise', updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com';
```

### Issue 3: BPO Status Wrong
**Problem:** `bpo_status = 'PENDING'` or `'REJECTED'`

**Fix:**
```sql
UPDATE profiles 
SET bpo_status = 'APPROVED', approved_at = NOW(), updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com';
```

### Issue 4: Account Not Active
**Problem:** `is_active = false`

**Fix:**
```sql
UPDATE profiles 
SET is_active = true, updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com';
```

### Issue 5: Modules Disabled
**Problem:** `bpo_withdrawals` or `wallet` module is disabled

**Fix:**
```sql
INSERT INTO module_settings (module_key, enabled)
VALUES ('bpo_withdrawals', true), ('wallet', true)
ON CONFLICT (module_key) DO UPDATE SET enabled = true;
```

### Issue 6: No Purchase Record
**Problem:** No PAID BPO purchase in database

**Note:** This only affects backend API calls, not frontend display

**Fix:**
```sql
-- See fix-withdrawal-access-NOW.sql for complete purchase creation
```

---

## 🔬 Advanced Debugging

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors when loading dashboard
4. Common errors:
   - `401 Unauthorized` - Token expired, re-login
   - `403 Forbidden` - BPO access denied
   - `500 Server Error` - Backend issue

### Check Network Tab
1. Open DevTools → Network tab
2. Reload dashboard
3. Look for these requests:
   - `GET /user/profile` - Should return user with correct role/plan
   - `GET /user/modules` - Should show enabled modules
   - `GET /user/withdrawals/access` - Should return `{ eligible: true }`

### Check API Response
Look at `/user/profile` response:
```json
{
  "id": "...",
  "email": "aliyaanmohd42@gmail.com",
  "role": "bpo_partner",           // ← Should be this
  "selectedPlan": "bpo-enterprise", // ← Or this set
  "accountType": "BPO",
  "bpoStatus": "APPROVED",
  "isActive": true
}
```

---

## ✅ Complete Fix Script

If all else fails, run this complete reset:

```sql
-- Complete reset and fix
BEGIN;

-- Step 1: Fix profile
UPDATE profiles 
SET 
    role = 'bpo_partner',
    account_type = 'BPO',
    bpo_status = 'APPROVED',
    selected_plan = 'bpo-enterprise',
    is_active = true,
    approved_at = NOW(),
    updated_at = NOW()
WHERE email = 'aliyaanmohd42@gmail.com';

-- Step 2: Delete old purchases
DELETE FROM purchases 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com')
AND package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise');

-- Step 3: Create fresh purchase
INSERT INTO purchases (
    user_id,
    package_id,
    package_name,
    paypal_order_id,
    amount,
    currency,
    status,
    purchased_at
)
SELECT
    id,
    'bpo-enterprise',
    'Enterprise BPO',
    'MANUAL_' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 16)),
    8000.00,
    'USD',
    'PAID',
    NOW()
FROM profiles
WHERE email = 'aliyaanmohd42@gmail.com';

-- Step 4: Enable modules
INSERT INTO module_settings (module_key, enabled)
VALUES ('bpo_withdrawals', true), ('wallet', true)
ON CONFLICT (module_key) DO UPDATE SET enabled = true;

-- Step 5: Create/update wallet
INSERT INTO wallets (user_id, balance, pending_balance, currency, is_locked)
SELECT id, 1000.00, 0.00, 'USD', false
FROM profiles WHERE email = 'aliyaanmohd42@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET balance = 1000.00;

COMMIT;

-- Verify
SELECT 
    email,
    role,
    selected_plan,
    account_type,
    bpo_status,
    is_active
FROM profiles 
WHERE email = 'aliyaanmohd42@gmail.com';
```

---

## 🎯 After Running Fix

1. **Hard refresh** the dashboard (Ctrl+F5)
2. **Clear browser cache** if needed
3. **Log out and log back in**
4. **Check sidebar** for "BPO Withdrawals" tab

---

## 📞 Still Not Working?

### Check These:
1. ✅ User is logged in
2. ✅ Using correct email
3. ✅ Session token is valid (not expired)
4. ✅ API server is running
5. ✅ Database connection works
6. ✅ No JavaScript errors in console

### Manual API Test:
```bash
# Get user token after login
# Then test withdrawal access:
curl https://your-domain.com/api/user/withdrawals/access \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
# { "eligible": true, "minimumAmount": 50 }
```

### Database Direct Check:
```sql
-- Should return TRUE
SELECT EXISTS(
    SELECT 1 FROM purchases
    WHERE user_id = (SELECT id FROM profiles WHERE email = 'aliyaanmohd42@gmail.com')
    AND package_id IN ('bpo-starter', 'bpo-growth', 'bpo-enterprise')
    AND status = 'PAID'
) as has_bpo_purchase;
```

---

## 📚 Files Reference

- **`fix-withdrawal-access-NOW.sql`** - Emergency fix (run this!)
- **`diagnose-user-withdrawal-access.sql`** - Diagnostic tool
- **`enable-bpo-withdrawal-complete.sql`** - Complete setup
- **`Verify-BPO-Withdrawal-Setup.ps1`** - PowerShell verification

---

## 🎉 Success Indicators

Tab should show when:
- ✅ Role is `'bpo_partner'` or `'partner'`, OR
- ✅ Selected plan is a BPO plan (`bpo-starter`, `bpo-growth`, `bpo-enterprise`)
- ✅ Account is active
- ✅ Modules are enabled

After fix, you should see:
```
Dashboard Sidebar:
  📊 Overview
  📁 Projects  
  💰 BPO Withdrawals [$1000] ← THIS!
  ⚙️  Settings
```

**That's it! The tab should appear immediately after running the fix.** 🚀
