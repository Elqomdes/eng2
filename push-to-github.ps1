# GitHub'a TÜM DOSYALARI push scripti
# Bu script TÜM değişiklikleri ve dosyaları commit edip GitHub'a pushlar

$ErrorActionPreference = "Stop"

# Çalışma dizini
$workspacePath = Get-Location

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GitHub Push Script - TÜM DOSYALAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Git repository kontrolü
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository bulunamadı!" -ForegroundColor Red
    Write-Host "Git repository başlatılıyor..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Remote kontrolü ve ayarlama
$remoteUrl = "https://github.com/Elqomdes/engcalis.git"
$remoteExists = git remote | Select-String -Pattern "origin"

if (-not $remoteExists) {
    Write-Host "Remote repository ekleniyor..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
} else {
    # Remote URL'i güncelle
    git remote set-url origin $remoteUrl
    Write-Host "Remote repository: $remoteUrl" -ForegroundColor Green
}

Write-Host ""
Write-Host "1. Git durumu kontrol ediliyor..." -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "2. TÜM dosyalar ekleniyor (git add -A)..." -ForegroundColor Yellow
# -A flag'i: TÜM değişiklikleri ekler (yeni, değişen, silinen)
git add -A

Write-Host ""
Write-Host "3. Staged dosyalar:" -ForegroundColor Yellow
git diff --cached --name-only

Write-Host ""
Write-Host "4. Commit yapılıyor..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Update: Tüm dosyalar eklendi - $timestamp"

# Eğer staged dosya yoksa commit yapma
$stagedFiles = git diff --cached --name-only
if ($stagedFiles) {
    git commit -m $commitMessage
    Write-Host "✅ Commit başarılı: $commitMessage" -ForegroundColor Green
} else {
    Write-Host "⚠️  Commit edilecek değişiklik yok." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. GitHub'a push yapılıyor..." -ForegroundColor Yellow
Write-Host "   Branch: main" -ForegroundColor Cyan
Write-Host "   Remote: origin" -ForegroundColor Cyan

# Önce pull yap (conflict'leri önlemek için)
Write-Host "   Önce remote'tan çekiliyor..." -ForegroundColor Gray
git pull origin main --rebase 2>&1 | Out-Null

# Push yap
git push -u origin main --force-with-lease

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ BAŞARILI: Tüm dosyalar GitHub'a pushlandı!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository: $remoteUrl" -ForegroundColor Cyan
    Write-Host "Branch: main" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ HATA: Push başarısız oldu!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Olası nedenler:" -ForegroundColor Yellow
    Write-Host "  - GitHub credentials eksik veya yanlış" -ForegroundColor Yellow
    Write-Host "  - Network bağlantı sorunu" -ForegroundColor Yellow
    Write-Host "  - Remote branch ile conflict" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manuel kontrol için:" -ForegroundColor Cyan
    Write-Host "  git status" -ForegroundColor White
    Write-Host "  git log --oneline -5" -ForegroundColor White
    exit 1
}
