# API Anahtarı Kurulum Rehberi

## 🎯 Sistem Durumu

Sisteminizde **yapay zeka ile otomatik değerlendirme** sistemi zaten mevcut ve çalışıyor! 

### Mevcut AI Özellikleri:
- ✅ **Yazma Değerlendirmesi**: Öğrencilerin yazdığı metinleri AI ile analiz eder
- ✅ **Konuşma Değerlendirmesi**: Konuşma transkriptlerini AI ile değerlendirir
- ✅ **Detaylı Geri Bildirim**: Dilbilgisi, kelime bilgisi, yapı, telaffuz, akıcılık analizi
- ✅ **İyileştirme Önerileri**: Öğrencilere özel pratik önerileri

## 📝 API Anahtarı Kurulumu

### Yerel Geliştirme (Local)

1. **`.env.local` dosyası oluşturun:**

Windows PowerShell:
```powershell
New-Item -Path .env.local -ItemType File
```

Mac/Linux:
```bash
touch .env.local
```

2. **Dosyayı açın ve API anahtarınızı ekleyin:**

```
OPENAI_API_KEY=your_api_key_here
```

**API Anahtarınızı Nereden Bulabilirsiniz:**
- OpenAI Platform Dashboard: https://platform.openai.com/api-keys
- Proje sahibinden veya sistem yöneticisinden
- Mevcut `.env.local` dosyanızdan (local development için)

3. **Sunucuyu yeniden başlatın:**
```bash
npm run dev
```

### Vercel Deployment

1. Vercel Dashboard'a gidin
2. Projenizi seçin
3. **Settings > Environment Variables** bölümüne gidin
4. Yeni variable ekleyin:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** API anahtarınızı buraya yapıştırın (OpenAI dashboard'dan veya proje yöneticisinden alın)
   - **Environment:** Production, Preview, Development (hepsini seçin)
5. **Save** butonuna tıklayın
6. Yeni bir deploy başlatın

## 🔍 API Anahtarını Test Etme

### Yazma Değerlendirmesi Testi:
1. `/writing` sayfasına gidin
2. Bir yazma görevi seçin
3. En az hedef kelime sayısı kadar yazın
4. **"AI ile Değerlendir"** butonuna tıklayın
5. Değerlendirme sonuçlarını görün

### Konuşma Değerlendirmesi Testi:
1. `/speaking` sayfasına gidin
2. Bir konuşma görevi seçin
3. Mikrofon ile kayıt yapın
4. Transkripti girin
5. **"AI ile Değerlendir"** butonuna tıklayın
6. Değerlendirme sonuçlarını görün

## ⚠️ Güvenlik Uyarıları

1. **API anahtarınızı asla:**
   - GitHub'a yüklemeyin
   - Public repository'lerde paylaşmayın
   - Kod içinde hardcode etmeyin
   - Başkalarıyla paylaşmayın

2. **Güvenli saklama:**
   - ✅ `.env.local` dosyası kullanın (local)
   - ✅ Vercel Environment Variables kullanın (production)
   - ✅ `.gitignore` dosyası `.env.local`'i otomatik ignore eder

3. **API anahtarı sızdırılırsa:**
   - OpenAI dashboard'dan eski anahtarı iptal edin
   - Yeni bir API anahtarı oluşturun
   - Tüm environment variable'ları güncelleyin

## 📊 API Kullanım Takibi

OpenAI API kullanımınızı takip etmek için:
1. [OpenAI Platform](https://platform.openai.com) hesabınıza giriş yapın
2. **Usage** bölümünden kullanım istatistiklerinizi görün
3. **Billing** bölümünden faturalama bilgilerinizi kontrol edin

## 🛠️ Sorun Giderme

### API Anahtarı Çalışmıyor

**Hata:** "OpenAI API key is not configured"
**Çözüm:**
1. `.env.local` dosyasının proje kök dizininde olduğundan emin olun
2. API anahtarının doğru yazıldığından emin olun (boşluk olmamalı)
3. Sunucuyu yeniden başlatın (`Ctrl+C` sonra `npm run dev`)

**Hata:** "Invalid OpenAI API key"
**Çözüm:**
1. API anahtarının tamamını kopyaladığınızdan emin olun
2. API anahtarının geçerli olduğundan emin olun
3. OpenAI dashboard'dan API anahtarınızı kontrol edin

**Hata:** "Rate limit exceeded"
**Çözüm:**
1. API kullanım limitinizi kontrol edin
2. Birkaç dakika bekleyin ve tekrar deneyin
3. OpenAI hesabınızda yeterli kredi olduğundan emin olun

## ✅ Kurulum Kontrol Listesi

- [ ] `.env.local` dosyası oluşturuldu
- [ ] API anahtarı `.env.local` dosyasına eklendi
- [ ] Sunucu yeniden başlatıldı
- [ ] Yazma değerlendirmesi test edildi
- [ ] Konuşma değerlendirmesi test edildi
- [ ] Vercel'de environment variable eklendi (production için)

---

**Son Güncelleme:** API anahtarı yapılandırıldı ve sistem hazır! 🚀

