# PowerShell script to verify BPO Withdrawal setup
# Usage: .\Verify-BPO-Withdrawal-Setup.ps1

param(
    [string]$Email = "aliyaanmohd42@gmail.com"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BPO WITHDRAWAL VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Email: $Email" -ForegroundColor Yellow
Write-Host ""

# Load environment variables from .env file
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
        }
    }
}

$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SERVICE_ROLE_KEY

if (-not $supabaseKey) {
    $supabaseKey = $env:SUPABASE_SECRET_KEY
}

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Error: Missing Supabase credentials in .env" -ForegroundColor Red
    Write-Host ""
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  VITE_SUPABASE_URL" -ForegroundColor Yellow
    Write-Host "  SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY)" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
}

$checks = @{
    profile = $false
    bpoAccess = $false
    purchase = $false
    wallet = $false
    modules = $false
}

try {
    # Check 1: User Profile
    Write-Host "🔍 Checking user profile..." -ForegroundColor Yellow
    $profileUri = "$supabaseUrl/rest/v1/profiles?email=eq.$Email" + "&select=*"
    $profileResponse = Invoke-RestMethod -Uri $profileUri -Method GET -Headers $headers
    
    if ($profileResponse.Count -gt 0) {
        $user = $profileResponse[0]
        Write-Host "  ✓ Profile found" -ForegroundColor Green
        Write-Host "    ID: $($user.id)"
        Write-Host "    Name: $($user.full_name)"
        Write-Host "    Role: $($user.role)"
        Write-Host "    Account Type: $($user.account_type)"
        Write-Host "    BPO Status: $($user.bpo_status)"
        Write-Host "    Selected Plan: $($user.selected_plan)"
        Write-Host "    Active: $($user.is_active)"
        $checks.profile = $true
        
        # Check BPO access
        if ($user.account_type -eq "BPO" -and 
            $user.bpo_status -eq "APPROVED" -and 
            $user.is_active -eq $true -and
            ($user.selected_plan -match "bpo-")) {
            Write-Host "  ✓ BPO access granted" -ForegroundColor Green
            $checks.bpoAccess = $true
        } else {
            Write-Host "  ✗ BPO access NOT properly configured" -ForegroundColor Red
        }
        
        # Check 2: Purchase Record
        Write-Host ""
        Write-Host "🔍 Checking BPO purchase..." -ForegroundColor Yellow
        $purchaseUri = "$supabaseUrl/rest/v1/purchases?user_id=eq.$($user.id)" + "&package_id=in.(bpo-starter,bpo-growth,bpo-enterprise)" + "&status=eq.PAID"
        $purchaseResponse = Invoke-RestMethod -Uri $purchaseUri -Method GET -Headers $headers
        
        if ($purchaseResponse.Count -gt 0) {
            Write-Host "  ✓ PAID BPO purchase found" -ForegroundColor Green
            foreach ($purchase in $purchaseResponse) {
                Write-Host "    Plan: $($purchase.package_name) ($($purchase.package_id))"
                Write-Host "    Amount: $($purchase.currency) $($purchase.amount)"
                Write-Host "    Date: $($purchase.purchased_at)"
            }
            $checks.purchase = $true
        } else {
            Write-Host "  ✗ No PAID BPO purchase found" -ForegroundColor Red
        }
        
        # Check 3: Wallet
        Write-Host ""
        Write-Host "🔍 Checking wallet..." -ForegroundColor Yellow
        $walletUri = "$supabaseUrl/rest/v1/wallets?user_id=eq.$($user.id)"
        $walletResponse = Invoke-RestMethod -Uri $walletUri -Method GET -Headers $headers
        
        if ($walletResponse.Count -gt 0) {
            $wallet = $walletResponse[0]
            Write-Host "  ✓ Wallet exists" -ForegroundColor Green
            Write-Host "    Balance: $($wallet.currency) $($wallet.balance)"
            Write-Host "    Pending: $($wallet.currency) $($wallet.pending_balance)"
            Write-Host "    Locked: $($wallet.is_locked)"
            $checks.wallet = $true
        } else {
            Write-Host "  ✗ Wallet not found" -ForegroundColor Red
        }
        
    } else {
        Write-Host "  ✗ User not found" -ForegroundColor Red
    }
    
    # Check 4: Module Settings
    Write-Host ""
    Write-Host "🔍 Checking modules..." -ForegroundColor Yellow
    $moduleUri = "$supabaseUrl/rest/v1/module_settings?module_key=in.(bpo_withdrawals,wallet)"
    $moduleResponse = Invoke-RestMethod -Uri $moduleUri -Method GET -Headers $headers
    
    if ($moduleResponse.Count -eq 2) {
        $allEnabled = $true
        foreach ($module in $moduleResponse) {
            $status = if ($module.enabled) { "✓ Enabled" } else { "✗ Disabled" }
            $color = if ($module.enabled) { "Green" } else { "Red" }
            Write-Host "  $status : $($module.module_key)" -ForegroundColor $color
            if (-not $module.enabled) { $allEnabled = $false }
        }
        $checks.modules = $allEnabled
    } else {
        Write-Host "  ✗ Required modules not found" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error during verification: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$allPassed = $true
foreach ($check in $checks.GetEnumerator()) {
    $status = if ($check.Value) { "✓ PASS" } else { "✗ FAIL" }
    $color = if ($check.Value) { "Green" } else { "Red" }
    $label = switch ($check.Key) {
        "profile" { "User Profile" }
        "bpoAccess" { "BPO Access" }
        "purchase" { "BPO Purchase" }
        "wallet" { "Wallet" }
        "modules" { "Modules" }
    }
    Write-Host "  $status : $label" -ForegroundColor $color
    if (-not $check.Value) { $allPassed = $false }
}

Write-Host ""
if ($allPassed) {
    Write-Host "✓✓✓ ALL CHECKS PASSED ✓✓✓" -ForegroundColor Green
    Write-Host ""
    Write-Host "User can now:" -ForegroundColor Green
    Write-Host "  ✓ Access BPO Withdrawals tab" -ForegroundColor Green
    Write-Host "  ✓ Add payout methods" -ForegroundColor Green
    Write-Host "  ✓ Request withdrawals" -ForegroundColor Green
    Write-Host "  ✓ View withdrawal history" -ForegroundColor Green
} else {
    Write-Host "✗✗✗ SOME CHECKS FAILED ✗✗✗" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run: enable-bpo-withdrawal-complete.sql" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
