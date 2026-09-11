# PowerShell script to unlock BPO access for a user
param([string]$Email = "aliyaanmohd42@gmail.com")

Write-Host "BPO Access Unlock Script" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Load .env
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+?)\s*=\s*(.+?)\s*$') {
            [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], 'Process')
        }
    }
}

$supabaseUrl = $env:VITE_SUPABASE_URL
$supabaseKey = $env:SUPABASE_SECRET_KEY

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "Error: Missing VITE_SUPABASE_URL or SUPABASE_SECRET_KEY" -ForegroundColor Red
    exit 1
}

$headers = @{
    "apikey" = $supabaseKey
    "Authorization" = "Bearer $supabaseKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

try {
    # Find user
    $uri = "$supabaseUrl/rest/v1/profiles?email=eq.$Email" + "&select=*"
    $userResponse = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
    
    if ($userResponse.Count -eq 0) {
        Write-Host "User not found: $Email" -ForegroundColor Red
        exit 1
    }
    
    $user = $userResponse[0]
    Write-Host "User found: $($user.email)" -ForegroundColor Green
    Write-Host "Current BPO Status: $($user.bpo_status)" -ForegroundColor Yellow
    Write-Host ""
    
    # Update user
    Write-Host "Unlocking BPO access..." -ForegroundColor Yellow
    $updateBody = @{
        account_type = "BPO"
        bpo_status = "APPROVED"
        is_active = $true
        approved_at = (Get-Date).ToUniversalTime().ToString("o")
        updated_at = (Get-Date).ToUniversalTime().ToString("o")
    } | ConvertTo-Json
    
    $updateUri = "$supabaseUrl/rest/v1/profiles?id=eq." + $user.id
    $updated = Invoke-RestMethod -Uri $updateUri -Method PATCH -Headers $headers -Body $updateBody
    
    Write-Host "BPO access unlocked successfully!" -ForegroundColor Green
    Write-Host "New BPO Status: $($updated[0].bpo_status)" -ForegroundColor Green
    Write-Host "Account Type: $($updated[0].account_type)" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
