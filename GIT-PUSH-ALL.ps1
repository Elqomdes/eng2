# GİT PUSH - TÜM DOSYALAR İÇİN KESIN ÇÖZÜM
# Bu script HER ZAMAN TÜM DOSYALARI pushlar

Write-Host "🚀 GİT PUSH - TÜM DOSYALAR" -ForegroundColor Green
Write-Host ""

# 1. TÜM değişiklikleri ekle (yeni, değişen, silinen)
Write-Host "📦 Tüm dosyalar ekleniyor..." -ForegroundColor Yellow
git add -A

# 2. Durumu göster
Write-Host "`n📋 Staged dosyalar:" -ForegroundColor Cyan
git status --short

# 3. Commit yap
$hasChanges = git diff --cached --name-only
if ($hasChanges) {
    Write-Host "`n💾 Commit yapılıyor..." -ForegroundColor Yellow
    git commit -m "Update: Tüm dosyalar - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} else {
    Write-Host "`n⚠️  Yeni değişiklik yok, commit atlanıyor." -ForegroundColor Yellow
}

# 4. Push yap
Write-Host "`n🚀 GitHub'a push yapılıyor..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BAŞARILI! Tüm dosyalar pushlandı." -ForegroundColor Green
} else {
    Write-Host "`n❌ HATA! Push başarısız." -ForegroundColor Red
    exit 1
}


