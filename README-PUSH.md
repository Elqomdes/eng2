# GitHub'a Push Talimatları

## Hızlı Push

PowerShell'de şu komutu çalıştırın:

```powershell
.\push-to-github.ps1
```

## Manuel Push

Eğer script çalışmazsa, aşağıdaki komutları sırayla çalıştırın:

```bash
# Git repository başlat (eğer yoksa)
git init
git branch -M main

# Remote ekle (eğer yoksa)
git remote add origin https://github.com/Elqomdes/engcalis.git

# Tüm dosyaları ekle
git add .

# Commit yap
git commit -m "Add AI evaluation features and complete English learning platform"

# Push yap
git push -u origin main
```

## Önemli Notlar

- `.env.local` dosyası otomatik olarak pushlanmaz (güvenlik için)
- Git yüklü olmalıdır
- GitHub credentials'larınız ayarlanmış olmalıdır
- İlk push için GitHub'da repository oluşturulmuş olmalıdır

## Git Kurulumu

Eğer git yüklü değilse:
1. [Git'i indirin](https://git-scm.com/download/win)
2. Kurulumu tamamlayın
3. PowerShell'i yeniden başlatın
4. Yukarıdaki komutları tekrar çalıştırın

