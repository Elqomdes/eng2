# Git kurulum scripti
# Bu script sadece bu projeyi (engcalisma) GitHub'a pushlamak için kullanılır
# Farklı dizinlerdeki dosyaları pushlamaz

$workspacePath = "C:\Users\Emre\Desktop\WEB SİTELERİ\engcalisma"

# Dizine git
Set-Location -Path $workspacePath

Write-Host "Git kurulumu başlatılıyor..." -ForegroundColor Yellow
Write-Host "Çalışma dizini: $workspacePath" -ForegroundColor Cyan

# Git init
Write-Host "Git repository başlatılıyor..." -ForegroundColor Yellow
git init

# README.md'yi ekle (kullanıcının istediği gibi)
Write-Host "README.md ekleniyor..." -ForegroundColor Yellow
git add README.md

# İlk commit
Write-Host "İlk commit yapılıyor..." -ForegroundColor Yellow
git commit -m "first commit"

# Branch'i main yap
Write-Host "Branch main olarak ayarlanıyor..." -ForegroundColor Yellow
git branch -M main

# Remote ekle
Write-Host "Remote repository ekleniyor..." -ForegroundColor Yellow
git remote add origin https://github.com/Elqomdes/engcalis.git

# Push yap
Write-Host "GitHub'a push yapılıyor..." -ForegroundColor Yellow
git push -u origin main

Write-Host "`nGit kurulumu tamamlandı!" -ForegroundColor Green
Write-Host "Bu script sadece engcalisma projesini pushlar." -ForegroundColor Green

