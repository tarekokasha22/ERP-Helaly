# PowerShell script to test the auth middleware
# Usage: .\test-auth.ps1 [token]

param (
    [string]$token = ""
)

# Base URL
$baseUrl = "http://localhost:3000"

Write-Host "`n=== Auth Middleware Test Script ===`n" -ForegroundColor Cyan

# Test public route
Write-Host "Testing public route..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/public" -Method Get
    Write-Host "SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# Test protected route without token
Write-Host "`nTesting protected route without token..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/protected" -Method Get -ErrorAction Stop
    Write-Host "SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "EXPECTED ERROR: Status $statusCode - $($errorDetails.message)" -ForegroundColor DarkYellow
}

# If token is provided, test with token
if ($token -ne "") {
    # Test protected route with token
    Write-Host "`nTesting protected route with token..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/api/protected" -Method Get -Headers $headers
        Write-Host "SUCCESS: $($response.message)" -ForegroundColor Green
        Write-Host "User: $($response.user | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "ERROR: Status $statusCode - $($errorDetails.message)" -ForegroundColor Red
    }

    # Test admin route with token
    Write-Host "`nTesting admin route with token..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/api/admin" -Method Get -Headers $headers
        Write-Host "SUCCESS: $($response.message)" -ForegroundColor Green
        Write-Host "User: $($response.user | ConvertTo-Json)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        if ($statusCode -eq 403) {
            Write-Host "EXPECTED ERROR: Status $statusCode - $($errorDetails.message)" -ForegroundColor DarkYellow
        } else {
            Write-Host "ERROR: Status $statusCode - $($errorDetails.message)" -ForegroundColor Red
        }
    }
} else {
    # Generate tokens
    Write-Host "`nGenerating test tokens..." -ForegroundColor Yellow
    
    # Generate user token
    try {
        $body = @{
            role = "user"
        } | ConvertTo-Json
        $userResponse = Invoke-RestMethod -Uri "$baseUrl/api/token" -Method Post -Body $body -ContentType "application/json"
        Write-Host "`nRegular User Token:" -ForegroundColor Cyan
        Write-Host $userResponse.token -ForegroundColor White
        Write-Host "To test with this token, run:" -ForegroundColor Cyan
        Write-Host ".\test-auth.ps1 '$($userResponse.token)'" -ForegroundColor White
    } catch {
        Write-Host "ERROR generating user token: $_" -ForegroundColor Red
    }
    
    # Generate admin token
    try {
        $body = @{
            role = "admin"
        } | ConvertTo-Json
        $adminResponse = Invoke-RestMethod -Uri "$baseUrl/api/token" -Method Post -Body $body -ContentType "application/json"
        Write-Host "`nAdmin User Token:" -ForegroundColor Cyan
        Write-Host $adminResponse.token -ForegroundColor White
        Write-Host "To test with this token, run:" -ForegroundColor Cyan
        Write-Host ".\test-auth.ps1 '$($adminResponse.token)'" -ForegroundColor White
    } catch {
        Write-Host "ERROR generating admin token: $_" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===`n" -ForegroundColor Cyan 