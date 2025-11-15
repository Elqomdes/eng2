# AI Değerlendirme Kurulumu

Bu proje, yazma ve konuşma çalışmalarını değerlendirmek için OpenAI API kullanmaktadır.

## Kurulum Adımları

1. Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
OPENAI_API_KEY=your_api_key_here
```

2. API anahtarınızı `.env.local` dosyasına ekleyin.

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

