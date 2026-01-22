# NovaWallet Mobile

React Native (Expo) tabanlı mobil uygulama.

## Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI
- Xcode (iOS simulator için)
- iOS Simulator

## Kurulum

```bash
# Bağımlılıkları yükle
npm install
```

## iOS Simulator'de Çalıştırma

### iPhone 17 Pro Max Simulator'ünde Çalıştırma

```bash
# iOS simulator script'ini çalıştır
npm run ios:simulator

# veya direkt script'i çalıştır
./scripts/run-ios.sh
```

Script otomatik olarak:
- Mac IP adresini bulur
- Backend'in çalışıp çalışmadığını kontrol eder
- iPhone 17 Pro Max simulator'ünü bulur veya Expo'nun otomatik seçimine bırakır
- API Base URL'i Mac IP adresi ile ayarlar
- Expo'yu iOS simulator'de başlatır

### Manuel Çalıştırma

```bash
# iOS Simulator için localhost
export EXPO_PUBLIC_API_BASE_URL="http://localhost:5100"

# Expo'yu başlat
npx expo start --ios
```

## Backend Bağlantısı

iOS Simulator'de backend'e bağlanmak için `localhost` kullanılır. Script otomatik olarak bunu yapar.
Fiziksel cihaz için `NOVA_API_HOST` veya `EXPO_PUBLIC_API_BASE_URL` ile Mac IP adresini ayarlayın.

Backend'in `http://localhost:5100` adresinde çalıştığından emin olun.
macOS'ta 5000 portu sistem servisleri tarafından kullanılabildiği için 5100 önerilir.
Farklı bir port kullanıyorsanız `EXPO_PUBLIC_API_BASE_URL` veya `EXPO_PUBLIC_API_PORT` ayarlayın.

## Sorun Giderme

### Backend'e Bağlanamıyorum

1. Backend'in çalıştığından emin olun:
   ```bash
   curl http://localhost:5100/swagger
   ```

2. Mac IP adresini kontrol edin:
   ```bash
   ipconfig getifaddr en0
   ```

3. Firewall ayarlarını kontrol edin (5100 portu açık olmalı)

### Simulator Bulunamıyor

1. Xcode'u açın
2. Window > Devices and Simulators
3. iPhone 17 Pro Max simulator'ünü oluşturun veya mevcut bir simulator kullanın

### Expo Başlamıyor

1. Node modules'ları temizleyip yeniden yükleyin:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Expo cache'ini temizleyin:
   ```bash
   npx expo start --clear
   ```
