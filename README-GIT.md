# Git Kurulum Talimatları

Bu proje için Git kurulumunu yapmak için aşağıdaki adımları izleyin:

## Otomatik Kurulum (Önerilen)

PowerShell'de şu komutu çalıştırın:

```powershell
.\setup-git.ps1
```

## Manuel Kurulum

Eğer otomatik script çalışmazsa, aşağıdaki komutları sırayla çalıştırın:

```bash
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/Elqomdes/engcalis.git
git push -u origin main
```

## Önemli Notlar

- Bu script **sadece bu projeyi (engcalisma)** pushlar
- Farklı dizinlerdeki dosyalar pushlanmaz
- Tüm değişiklikler bu proje dizininde kalır

## Sonraki Push'lar İçin

Gelecekte değişiklik yaptığınızda:

```bash
git add .
git commit -m "your commit message"
git push
```

