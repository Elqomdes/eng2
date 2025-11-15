# AI Değerlendirme Kurulumu

Bu proje, yazma ve konuşma çalışmalarını değerlendirmek için OpenAI API kullanmaktadır.

## 🎯 Mevcut Özellikler

Sistem şu anda **yapay zeka ile otomatik değerlendirme** yapmaktadır:

### ✅ Yazma Değerlendirmesi
- Öğrencilerin yazdığı metinleri AI ile analiz eder
- Dilbilgisi, kelime bilgisi, yapı ve organizasyonu değerlendirir
- Detaylı geri bildirim ve iyileştirme önerileri sunar

### ✅ Konuşma Değerlendirmesi
- Öğrencilerin konuşma transkriptlerini AI ile analiz eder
- Telaffuz, akıcılık, dilbilgisi ve kelime bilgisini değerlendirir
- Pratik önerileri ve geliştirme alanlarını belirler

## Kurulum Adımları

1. Proje kök dizininde `.env.local` dosyası oluşturun:

**Windows (PowerShell):**
```powershell
New-Item -Path .env.local -ItemType File
```

**Mac/Linux:**
```bash
touch .env.local
```

2. `.env.local` dosyasını açın ve API anahtarınızı ekleyin:

```
OPENAI_API_KEY=your_api_key_here
```

**Not:** API anahtarınızı `API-KEY-SETUP.md` dosyasından veya OpenAI dashboard'dan alabilirsiniz.

**⚠️ ÖNEMLİ GÜVENLİK UYARISI:**
- API anahtarınızı asla GitHub'a yüklemeyin
- `.env.local` dosyası `.gitignore` içinde olduğu için otomatik olarak ignore edilir
- API anahtarınızı kimseyle paylaşmayın

3. Bağımlılıkları yükleyin:

```bash
npm install
```

4. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

## Kullanım

### Yazma Değerlendirmesi

1. Yazma sayfasına gidin
2. Yazınızı yazın (hedef kelime sayısına ulaşın)
3. "AI ile Değerlendir" butonuna tıklayın
4. AI'ın detaylı değerlendirmesini görün

### Konuşma Değerlendirmesi

1. Konuşma sayfasına gidin
2. Mikrofonunuzla konuşun
3. Kayıt tamamlandıktan sonra transkripti girin
4. "AI ile Değerlendir" butonuna tıklayın
5. AI'ın detaylı değerlendirmesini görün

## Değerlendirme Kriterleri

### Yazma
- Dilbilgisi
- Kelime bilgisi
- Yapı ve organizasyon
- İçerik kalitesi
- Genel geri bildirim

### Konuşma
- Telaffuz
- Akıcılık
- Dilbilgisi
- Kelime bilgisi
- İçerik ve fikirler

## Notlar

- API anahtarı güvenli bir şekilde `.env.local` dosyasında saklanmalıdır
- `.env.local` dosyası `.gitignore` içinde olduğu için GitHub'a pushlanmaz
- API kullanımı ücretlidir, kullanımınızı kontrol edin

