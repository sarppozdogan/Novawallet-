# iOS Simulator Hızlı Başlangıç

## ⚠️ ÖNEMLİ: Doğru Dizinde Olun!

Expo komutlarını **mutlaka `mobile` dizininde** çalıştırın!

```bash
# ✅ DOĞRU
cd mobile
npx expo start --ios

# ❌ YANLIŞ (root dizinde)
npx expo start --ios
```

## Hızlı Başlatma

### 1. Backend'i Başlat (Terminal 1)
```bash
# Proje root dizininde
./scripts/start-backend.sh
```

### 2. Frontend'i iOS Simulator'de Başlat (Terminal 2)
```bash
# mobile dizinine git
cd mobile

# Script ile başlat (önerilen)
npm run ios:simulator

# VEYA manuel
npx expo start --ios
```

## Sorun Giderme

### "package.json does not exist" Hatası
- **Çözüm:** `mobile` dizinine gidin: `cd mobile`

### Expo CLI Kurulumu İsteniyor
- **Çözüm:** `y` yazıp Enter'a basın (ilk kez çalıştırıyorsanız)

### Backend'e Bağlanamıyor
- Backend'in `http://localhost:5000` adresinde çalıştığından emin olun
- Mac IP adresini kontrol edin: `ipconfig getifaddr en0`
