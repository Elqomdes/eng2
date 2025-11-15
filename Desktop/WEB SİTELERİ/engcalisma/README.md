# İngilizce Öğrenme Platformu

Modern ve kapsamlı bir İngilizce öğrenme platformu. Okuma, Yazma, Dinleme ve Konuşma becerilerinizi geliştirmek için tasarlanmış profesyonel bir web uygulaması.

## 🚀 Özellikler

### 📚 Okuma (Reading)
- Farklı seviyelerde okuma metinleri
- Anlama soruları ile pratik
- İlerleme takibi
- Detaylı geri bildirim

### ✍️ Yazma (Writing)
- Seviyeye uygun yazma görevleri
- Kelime sayısı takibi
- AI destekli değerlendirme
- Detaylı geri bildirim (dilbilgisi, kelime bilgisi, yapı)

### 🎧 Dinleme (Listening)
- İnteraktif dinleme egzersizleri
- Transkript desteği
- Anlama soruları
- İlerleme takibi

### 🎤 Konuşma (Speaking)
- Mikrofon ile kayıt özelliği
- AI destekli değerlendirme
- Telaffuz ve akıcılık analizi
- Detaylı geri bildirim

### 📊 İlerleme Takibi
- Her beceri için ayrı ilerleme takibi
- Toplam tamamlanan aktivite sayısı
- Çalışma süresi takibi
- Başarı rozetleri

## 🛠️ Teknolojiler

- **Next.js 14** - React framework
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Modern UI tasarımı
- **Framer Motion** - Animasyonlar
- **OpenAI API** - AI değerlendirme
- **Lucide React** - İkonlar

## 📦 Kurulum

### Gereksinimler

- Node.js 18+ 
- npm veya yarn
- OpenAI API anahtarı (AI değerlendirme için)

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone <repository-url>
cd engcalisma
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın:**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını oluşturun ve API anahtarınızı ekleyin:

```
OPENAI_API_KEY=your_api_key_here
```

**Not:** API anahtarınızı `API-KEY-SETUP.md` dosyasından veya OpenAI dashboard'dan alabilirsiniz.

4. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

## 🚀 Kullanım

### Okuma Pratikleri
1. Ana sayfadan "Okuma" bölümüne gidin
2. Bir metin seçin ve okuyun
3. Soruları cevaplayın
4. Sonuçlarınızı görün ve ilerlemenizi takip edin

### Yazma Pratikleri
1. "Yazma" bölümüne gidin
2. Bir yazma görevi seçin
3. Hedef kelime sayısına ulaşın
4. "AI ile Değerlendir" butonuna tıklayın
5. Detaylı geri bildirimi inceleyin

### Dinleme Pratikleri
1. "Dinleme" bölümüne gidin
2. Bir egzersiz seçin
3. Dinleme kaydını oynatın
4. Soruları cevaplayın
5. İsterseniz transkripti görüntüleyin

### Konuşma Pratikleri
1. "Konuşma" bölümüne gidin
2. Bir görev seçin
3. Mikrofon izni verin
4. Konuşmanızı kaydedin
5. Transkripti girin
6. "AI ile Değerlendir" butonuna tıklayın
7. Detaylı geri bildirimi inceleyin

## 📝 AI Değerlendirme

Platform, yazma ve konuşma çalışmalarınızı değerlendirmek için OpenAI API kullanmaktadır. Detaylı kurulum bilgileri için [AI-SETUP.md](./AI-SETUP.md) dosyasına bakın.

### Değerlendirme Kriterleri

**Yazma:**
- Dilbilgisi
- Kelime bilgisi
- Yapı ve organizasyon
- İçerik kalitesi

**Konuşma:**
- Telaffuz
- Akıcılık
- Dilbilgisi
- Kelime bilgisi
- İçerik ve fikirler

## 📊 İlerleme Takibi

Platform, tüm aktivitelerinizi otomatik olarak takip eder:
- Her beceri için ayrı ilerleme yüzdesi
- Tamamlanan aktivite sayısı
- Toplam çalışma süresi
- Başarı rozetleri

Verileriniz tarayıcınızın localStorage'ında saklanır.

## 🎨 Özelleştirme

### Renkler
Tailwind config dosyasından (`tailwind.config.js`) renkleri özelleştirebilirsiniz.

### İçerik
Her beceri sayfasındaki içerikleri (`app/reading/page.tsx`, `app/writing/page.tsx`, vb.) düzenleyerek yeni egzersizler ekleyebilirsiniz.

## 📄 Lisans

Bu proje özel kullanım içindir.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request göndermeden önce:
1. Projeyi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız veya önerileriniz için issue açabilirsiniz.

## 🙏 Teşekkürler

Bu projeyi kullandığınız için teşekkür ederiz! İyi çalışmalar! 🎉
