# Auto-sync fork with upstream
param([switch]$AutoRun)

$repoPath = "d:\codinggggg\nexevent"
cd $repoPath

Write-Host "?? Syncing fork with upstream..." -ForegroundColor Cyan

# Fetch latest from upstream
git fetch upstream
Write-Host "? Fetched from upstream" -ForegroundColor Green

# Checkout main branch and merge upstream
git checkout main 2>$null
git merge upstream/main --no-edit
Write-Host "? Merged upstream/main into local main" -ForegroundColor Green

# Push changes back to your fork
git push origin main
Write-Host "? Pushed to your fork" -ForegroundColor Green

Write-Host "? Sync complete!" -ForegroundColor Green
