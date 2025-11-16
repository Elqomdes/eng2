# MongoDB Kurulum Rehberi

## ✅ Yapılan Kurulumlar

MongoDB bağlantısı başarıyla kuruldu ve tüm entegrasyonlar tamamlandı!

### Kurulu Paketler
- ✅ `mongoose` - MongoDB ODM (Object Document Mapper)

### Oluşturulan Dosyalar
- ✅ `lib/mongodb.ts` - MongoDB bağlantı yönetimi
- ✅ `lib/models/Progress.ts` - İlerleme verileri için MongoDB modeli
- ✅ `app/api/progress/route.ts` - İlerleme verileri için API endpoint'leri

### Güncellenen Dosyalar
- ✅ `components/ProgressProvider.tsx` - MongoDB entegrasyonu eklendi
- ✅ `env.example` - MongoDB connection string eklendi

## 📝 Kurulum Adımları

### 1. Environment Variables Ayarlama

`.env.local` dosyasını oluşturun (proje kök dizininde):

**Windows PowerShell:**
```powershell
New-Item -Path .env.local -ItemType File
```

**Mac/Linux:**
```bash
touch .env.local
```

### 2. MongoDB Connection String Ekleme

`.env.local` dosyasını açın ve şu içeriği ekleyin:

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Connection String
# ÖNEMLİ: <db_password> kısmını gerçek veritabanı şifrenizle değiştirin
MONGODB_URI=mongodb+srv://mey4249:<db_password>@engwork.6ibljrz.mongodb.net/?appName=engwork
```

**⚠️ ÖNEMLİ:** 
- `<db_password>` kısmını MongoDB Atlas'tan aldığınız gerçek şifre ile değiştirin
- Şifre özel karakterler içeriyorsa URL encoding yapmanız gerekebilir
- Örnek: `mypassword123` → `mypassword123`
- Örnek: `pass@word!` → `pass%40word%21` (URL encoded)

### 3. Sunucuyu Yeniden Başlatma

Environment variable'ları ekledikten sonra sunucuyu yeniden başlatın:

```bash
npm run dev
```

## 🔧 MongoDB Bağlantı Özellikleri

### Bağlantı Yönetimi
- **Connection Caching**: Hot reload sırasında bağlantı cache'lenir
- **Auto-reconnect**: Bağlantı koparsa otomatik yeniden bağlanır
- **Error Handling**: Hata durumlarında detaylı loglama

### Veri Modeli
İlerleme verileri şu yapıda saklanır:
```typescript
{
  userId: string (default: 'default')
  totalCompleted: number
  totalTime: number (dakika cinsinden)
  overallProgress: number (0-100)
  achievements: number
  skills: {
    reading: number (0-100)
    writing: number (0-100)
    listening: number (0-100)
    speaking: number (0-100)
  }
  createdAt: Date
  updatedAt: Date
}
```

## 📡 API Endpoints

### GET `/api/progress`
İlerleme verilerini getirir.

**Query Parameters:**
- `userId` (optional): Kullanıcı ID (varsayılan: 'default')

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCompleted": 10,
    "totalTime": 120,
    "overallProgress": 75,
    "achievements": 50,
    "skills": {
      "reading": 80,
      "writing": 70,
      "listening": 75,
      "speaking": 75
    }
  }
}
```

### POST `/api/progress`
İlerleme verilerini günceller veya yeni kayıt oluşturur.

**Request Body:**
```json
{
  "userId": "default",
  "totalCompleted": 10,
  "totalTime": 120,
  "overallProgress": 75,
  "achievements": 50,
  "skills": {
    "reading": 80,
    "writing": 70,
    "listening": 75,
    "speaking": 75
  }
}
```

### PATCH `/api/progress`
İlerleme verilerini artırmalı olarak günceller (incremental update).

**Request Body:**
```json
{
  "userId": "default",
  "totalCompleted": 1,  // Mevcut değere eklenir
  "totalTime": 5,        // Mevcut değere eklenir
  "skills": {
    "reading": 5         // Mevcut değere eklenir (0-100 arasında sınırlanır)
  }
}
```

## 🔄 Otomatik Senkronizasyon

ProgressProvider otomatik olarak:
1. **Sayfa yüklendiğinde**: MongoDB'den veri çeker, yoksa localStorage'dan yükler
2. **Veri değiştiğinde**: 
   - Hemen localStorage'a kaydeder (hızlı erişim için)
   - 1 saniye sonra MongoDB'ye kaydeder (debounced, performans için)

### Fallback Mekanizması
- Önce MongoDB'den yüklemeyi dener
- Başarısız olursa localStorage'dan yükler
- localStorage'dan yüklenen veriler arka planda MongoDB'ye senkronize edilir

## 🧪 Test Etme

### 1. Bağlantıyı Test Etme
Tarayıcı konsolunu açın ve şu komutu çalıştırın:
```javascript
fetch('/api/progress?userId=default').then(r => r.json()).then(console.log)
```

### 2. Veri Kaydetmeyi Test Etme
```javascript
fetch('/api/progress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'default',
    totalCompleted: 1,
    totalTime: 5,
    overallProgress: 10,
    achievements: 1,
    skills: { reading: 10, writing: 10, listening: 10, speaking: 10 }
  })
}).then(r => r.json()).then(console.log)
```

## 🚀 Production Deployment

### Vercel Deployment
Vercel dashboard'da projenizin **Settings > Environment Variables** bölümüne gidin ve şu değişkeni ekleyin:

```
MONGODB_URI=mongodb+srv://mey4249:<db_password>@engwork.6ibljrz.mongodb.net/?appName=engwork
```

**⚠️ GÜVENLİK NOTU:**
- `<db_password>` kısmını gerçek şifre ile değiştirin
- Environment variable'ları asla kod içinde veya public repository'lerde saklamayın
- Vercel dashboard'da environment variable olarak ekleyin

## 🐛 Sorun Giderme

### Bağlantı Hatası
```
Error: Please define the MONGODB_URI environment variable inside .env.local
```
**Çözüm:** `.env.local` dosyasını oluşturup `MONGODB_URI` değişkenini ekleyin.

### Authentication Hatası
```
MongoServerError: Authentication failed
```
**Çözüm:** Connection string'deki şifrenin doğru olduğundan emin olun. Özel karakterler varsa URL encoding yapın.

### Network Timeout
```
MongoServerError: connection timed out
```
**Çözüm:** 
- MongoDB Atlas'ta IP whitelist ayarlarını kontrol edin (0.0.0.0/0 tüm IP'lere izin verir)
- Firewall ayarlarını kontrol edin

## 📚 Ek Kaynaklar

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

