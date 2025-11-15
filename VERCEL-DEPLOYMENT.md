# Vercel Deployment Kılavuzu

Bu dokümantasyon, projenin Vercel'de sorunsuz bir şekilde deploy edilmesi için gerekli tüm adımları içerir.

## ✅ Yapılan Optimizasyonlar

### 1. API Route Optimizasyonları
- ✅ Runtime ayarı eklendi (`nodejs`)
- ✅ Max duration ayarı eklendi (60 saniye)
- ✅ Hata yönetimi iyileştirildi
- ✅ Environment variable kontrolleri eklendi

### 2. SSR/CSR Uyumluluğu
- ✅ localStorage kullanımı client-side kontrolü ile güvenli hale getirildi
- ✅ `typeof window` kontrolleri eklendi
- ✅ Server-side rendering hataları önlendi

### 3. Metadata Optimizasyonları
- ✅ `metadataBase` güvenli hale getirildi (undefined fallback)
- ✅ SEO meta etiketleri eklendi
- ✅ OpenGraph ve Twitter Cards yapılandırıldı
- ✅ Viewport ayarları eklendi

### 4. Next.js Config Optimizasyonları
- ✅ SWC minification aktif
- ✅ Production console.log temizleme
- ✅ Image optimization ayarları

### 5. Vercel Özel Ayarlar
- ✅ `vercel.json` dosyası oluşturuldu
- ✅ Function timeout ayarları yapıldı
- ✅ Region ayarları yapılandırıldı

## 📋 Deployment Adımları

### 1. Vercel Hesabı ve Proje Oluşturma

1. [Vercel](https://vercel.com) hesabınıza giriş yapın
2. "Add New Project" butonuna tıklayın
3. GitHub repository'nizi seçin veya import edin

### 2. Environment Variables Ayarlama

Vercel dashboard'da projenizin **Settings > Environment Variables** bölümüne gidin ve şu değişkenleri ekleyin:

#### Zorunlu Değişkenler:
```
OPENAI_API_KEY=your_openai_api_key_here
```

**⚠️ GÜVENLİK NOTU:** 
- API anahtarınızı `API-KEY-SETUP.md` dosyasından veya OpenAI dashboard'dan alın
- API anahtarını asla kod içinde veya public repository'lerde saklamayın
- Vercel dashboard'da environment variable olarak ekleyin

#### Opsiyonel Değişkenler:
```
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**Önemli:** 
- `OPENAI_API_KEY` mutlaka eklenmelidir (AI değerlendirme için)
- `NEXT_PUBLIC_SITE_URL` sadece production için gerekli (SEO için)

### 3. Build Ayarları

Vercel otomatik olarak Next.js projelerini algılar, ancak manuel kontrol için:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (otomatik)
- **Output Directory:** `.next` (otomatik)
- **Install Command:** `npm install` (otomatik)

### 4. Deployment

1. **GitHub Integration:**
   - Repository'yi Vercel'e bağlayın
   - Her push otomatik deploy tetikler

2. **Manuel Deploy:**
   ```bash
   npm install -g vercel
   vercel
   ```

### 5. Post-Deployment Kontrolleri

Deploy sonrası kontrol edin:

- ✅ Ana sayfa yükleniyor mu?
- ✅ Tüm route'lar çalışıyor mu? (`/reading`, `/writing`, `/listening`, `/speaking`)
- ✅ API endpoint çalışıyor mu? (`/api/evaluate`)
- ✅ Environment variables doğru mu?

## 🔧 Sorun Giderme

### Build Hataları

**Hata:** `Module not found`
**Çözüm:** `package.json` dosyasında tüm bağımlılıkların doğru olduğundan emin olun.

**Hata:** `Environment variable not found`
**Çözüm:** Vercel dashboard'da environment variables'ları kontrol edin.

**Hata:** `API route timeout`
**Çözüm:** `vercel.json` dosyasındaki `maxDuration` ayarını kontrol edin (max 60 saniye).

### Runtime Hataları

**Hata:** `localStorage is not defined`
**Çözüm:** ✅ Zaten düzeltildi - `typeof window` kontrolleri eklendi.

**Hata:** `metadataBase URL error`
**Çözüm:** ✅ Zaten düzeltildi - undefined fallback eklendi.

**Hata:** `OpenAI API key missing`
**Çözüm:** Vercel dashboard'da `OPENAI_API_KEY` environment variable'ını ekleyin.

## 📝 Önemli Notlar

1. **API Rate Limits:** OpenAI API rate limit'lerine dikkat edin
2. **Function Timeout:** Vercel'in ücretsiz planında function timeout 10 saniye, Pro plan'da 60 saniye
3. **Environment Variables:** Production, Preview ve Development için ayrı ayrı ayarlanabilir
4. **Build Cache:** Vercel build cache kullanır, büyük değişikliklerde cache'i temizlemek gerekebilir

## 🚀 Performance İpuçları

1. **Image Optimization:** Next.js Image component kullanılmadığı için şu an gerek yok
2. **Code Splitting:** Next.js otomatik olarak yapar
3. **Static Generation:** Mümkün olduğunca static sayfalar kullanılıyor
4. **API Optimization:** API route'lar optimize edildi

## 📞 Destek

Sorun yaşarsanız:
1. Vercel dashboard'daki build loglarını kontrol edin
2. Browser console'da hataları kontrol edin
3. Network tab'da API isteklerini kontrol edin

## ✅ Deployment Checklist

- [ ] GitHub repository hazır
- [ ] Vercel hesabı oluşturuldu
- [ ] Proje Vercel'e import edildi
- [ ] `OPENAI_API_KEY` environment variable eklendi
- [ ] `NEXT_PUBLIC_SITE_URL` (opsiyonel) eklendi
- [ ] İlk deploy başarılı
- [ ] Tüm sayfalar test edildi
- [ ] API endpoint'leri test edildi
- [ ] Production domain ayarlandı (opsiyonel)

---

**Son Güncelleme:** Tüm Vercel deployment sorunları giderildi ve optimizasyonlar yapıldı. ✅

