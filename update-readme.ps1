# README.md güncelleme scripti
$workspacePath = "C:\Users\Emre\Desktop\WEB SİTELERİ\engcalisma"

Set-Location -Path $workspacePath

Write-Host "README.md güncelleniyor..." -ForegroundColor Yellow

& "C:\Program Files\Git\bin\git.exe" add README.md
& "C:\Program Files\Git\bin\git.exe" commit -m "Update README.md for English Learning Platform"
& "C:\Program Files\Git\bin\git.exe" push origin main

Write-Host "✅ README.md güncellendi!" -ForegroundColor Green



