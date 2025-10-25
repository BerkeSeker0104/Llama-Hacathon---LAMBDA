# AI Integration Guide

Bu rehber, AI ekibinin Python kodunu web uygulamasına entegre etme sürecini açıklar.

## 🎯 Entegrasyon Özeti

**Tamamlanan İşlemler:**
- ✅ Firebase Cloud Functions (Python) kurulumu
- ✅ Contract analyzer kodunu Cloud Function'a dönüştürme
- ✅ Sprint planner kodunu Cloud Function'a dönüştürme  
- ✅ Web app API routes'larını Cloud Functions'a bağlama
- ✅ Contract detay sayfasına Sprint Plan tab'ı ekleme
- ✅ Firestore schema'yı AI çıktısına göre güncelleme
- ✅ Environment variables yapılandırması

## 🚀 Deployment Adımları

### 1. Cloud Functions Deploy

```bash
# Firebase CLI ile giriş yapın
firebase login

# Projeyi seçin
firebase use your-project-id

# Environment variables'ları ayarlayın
firebase functions:config:set groq.api_key="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"
firebase functions:config:set llama.api_key="llx-SHymI9q0Tr65lYHubePG7sH2BwFo3myVLst8NuJThdP7x1LS"

# Cloud Functions'ı deploy edin
firebase deploy --only functions
```

### 2. Web App Environment Variables

`.env.local` dosyasına ekleyin:

```env
# Cloud Functions URLs
NEXT_PUBLIC_CLOUD_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
NEXT_PUBLIC_CLOUD_FUNCTIONS_REGION=us-central1
```

### 3. Web App Deploy

```bash
npm run build
firebase deploy --only hosting
```

## 🔧 Yeni Özellikler

### Contract Analysis
- **Lokasyon:** `/api/contracts/trigger-analysis`
- **İşlev:** PDF yükleme → LlamaParse → Groq Analysis → Firestore
- **Süre:** 5-15 saniye

### Sprint Planning
- **Lokasyon:** `/api/plans/generate`
- **İşlev:** Contract analysis → Groq Sprint Planning → Firestore
- **Süre:** 3-8 saniye

### UI Güncellemeleri
- **Yeni Tab:** Contract detay sayfasında "Sprint Plan" tab'ı
- **Komponent:** `SprintPlanView` - Sprint planlarını görüntüleme ve oluşturma
- **Real-time:** Firestore listeners ile canlı güncellemeler

## 📁 Dosya Yapısı

```
/functions
  /main.py              # Cloud Functions entry point
  /contract_analyzer.py # AI contract analysis
  /sprint_planner.py    # AI sprint planning
  /requirements.txt     # Python dependencies
  /config.py           # Configuration
  /README.md           # Functions documentation

/src/app/api
  /contracts/trigger-analysis/route.ts  # Updated to call Cloud Function
  /plans/generate/route.ts              # New sprint plan endpoint

/src/components
  /SprintPlanView.tsx                  # New sprint plan UI component

/src/lib
  /firestore-schema.ts                 # Updated with AI output fields
```

## 🧪 Test Senaryosu

1. **Contract Oluşturma:**
   - Dashboard → "New Contract"
   - PDF yükle
   - "Analyze Contract" butonuna bas

2. **AI Analysis:**
   - 5-15 saniye bekle
   - Analysis sonuçları otomatik görünür
   - 6 tab'da detayları incele

3. **Sprint Plan Oluşturma:**
   - "Sprint Plan" tab'ına git
   - "Generate Sprint Plan" butonuna bas
   - 3-8 saniye bekle
   - Sprint planı görüntüle

## 🔍 Troubleshooting

### Cloud Functions Hatası
```bash
# Logs kontrol et
firebase functions:log

# Local test
firebase functions:shell
```

### API Connection Hatası
- Cloud Functions URL'ini kontrol et
- Environment variables'ları kontrol et
- Firebase project ID'yi kontrol et

### PDF Parse Hatası
- LlamaParse API key'ini kontrol et
- PDF formatını kontrol et (sadece PDF desteklenir)
- Firebase Storage permissions'ı kontrol et

## 📊 Performance

**Beklenen Süreler:**
- Contract Analysis: 5-15 saniye
- Sprint Planning: 3-8 saniye
- PDF Upload: 2-5 saniye

**Optimizasyonlar:**
- LlamaParse num_workers=4
- Groq API hızlı modeller (llama-3.1-8b-instant)
- Firestore real-time listeners
- Cloud Functions timeout: 60 saniye

## 🔐 Güvenlik

- API anahtarları sadece Cloud Functions'ta
- PDF Storage bucket private
- Firestore Security Rules aktif
- Cloud Functions authentication gerekli

## 📈 Monitoring

**Firebase Console'da kontrol edin:**
- Functions → Logs
- Firestore → Data
- Storage → Files
- Analytics → Events

## 🎉 Sonuç

AI entegrasyonu başarıyla tamamlandı! Artık:
- PDF'ler otomatik analiz ediliyor
- Sprint planları AI ile oluşturuluyor
- Real-time güncellemeler çalışıyor
- Kullanıcı dostu arayüz hazır

**Demo için hazır! 🚀**
