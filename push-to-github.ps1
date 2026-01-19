# Script to push code to GitHub
# Usage: .\push-to-github.ps1 -RepoName "helaly-erp" -GitHubUsername "your-username"

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "`n=== Setting up GitHub Repository ===" -ForegroundColor Cyan
Write-Host "Repository Name: $RepoName" -ForegroundColor Yellow
Write-Host "GitHub Username: $GitHubUsername" -ForegroundColor Yellow

# Check if remote already exists
$remoteExists = git remote -v | Select-String -Pattern "origin"
if ($remoteExists) {
    Write-Host "`nRemote 'origin' already exists. Removing it..." -ForegroundColor Yellow
    git remote remove origin
}

# Add remote repository
$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "`nAdding remote: $remoteUrl" -ForegroundColor Green
git remote add origin $remoteUrl

# Check current branch name
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    $currentBranch = "main"
    git branch -M main
} elseif ($currentBranch -eq "master") {
    git branch -M main
    $currentBranch = "main"
}

Write-Host "`nCurrent branch: $currentBranch" -ForegroundColor Green

# Push to GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may need to authenticate with GitHub." -ForegroundColor Cyan
Write-Host "If prompted, use your GitHub Personal Access Token as password." -ForegroundColor Cyan

git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Failed to push. Please check the error above." -ForegroundColor Red
    Write-Host "`nManual steps:" -ForegroundColor Yellow
    Write-Host "1. Create a repository named '$RepoName' on GitHub.com" -ForegroundColor White
    Write-Host "2. Run: git remote add origin https://github.com/$GitHubUsername/$RepoName.git" -ForegroundColor White
    Write-Host "3. Run: git push -u origin $currentBranch" -ForegroundColor White
}
