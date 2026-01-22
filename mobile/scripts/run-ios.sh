#!/bin/bash

# iOS Simulator için NovaWallet uygulamasını çalıştırma scripti
# iPhone 17 Pro Max simulator'ünde çalıştırır

set -e

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# API portu (macOS'ta 5000 portu sistem tarafından kullanılabildiği için 5100 varsayılan)
API_PORT="${NOVA_API_PORT:-5100}"

echo -e "${GREEN}🚀 NovaWallet iOS Simulator Başlatılıyor...${NC}"

# Mac IP adresini al (en0 veya en1 interface'inden)
get_mac_ip() {
  # Önce en0'ı dene
  IP=$(ipconfig getifaddr en0 2>/dev/null)
  if [ -z "$IP" ]; then
    # en0 yoksa en1'i dene
    IP=$(ipconfig getifaddr en1 2>/dev/null)
  fi
  if [ -z "$IP" ]; then
    # Son çare olarak ifconfig kullan
    IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
  fi
  echo "$IP"
}

MAC_IP=$(get_mac_ip)

if [ -z "$MAC_IP" ]; then
  echo -e "${RED}❌ Mac IP adresi bulunamadı. localhost kullanılacak.${NC}"
  MAC_IP="localhost"
else
  echo -e "${GREEN}✓ Mac IP adresi: ${MAC_IP}${NC}"
fi

# iPhone 17 Pro Max simulator'ünü bul veya alternatif bir simulator seç
echo -e "${YELLOW}📱 iPhone 17 Pro Max simulator'ü kontrol ediliyor...${NC}"

# Önce iPhone 17 Pro Max'i ara
DEVICE_ID=$(xcrun simctl list devices available | grep -i "iPhone 17 Pro Max" | grep -o '[A-F0-9-]\{36\}' | head -1)

# Bulunamazsa iPhone 16 Pro Max'i dene
if [ -z "$DEVICE_ID" ]; then
  echo -e "${YELLOW}⚠ iPhone 17 Pro Max bulunamadı. iPhone 16 Pro Max aranıyor...${NC}"
  DEVICE_ID=$(xcrun simctl list devices available | grep -i "iPhone 16 Pro Max" | grep -o '[A-F0-9-]\{36\}' | head -1)
fi

# Hala bulunamazsa herhangi bir Pro Max modelini dene
if [ -z "$DEVICE_ID" ]; then
  echo -e "${YELLOW}⚠ iPhone 16 Pro Max bulunamadı. Herhangi bir Pro Max modeli aranıyor...${NC}"
  DEVICE_ID=$(xcrun simctl list devices available | grep -i "iPhone.*Pro Max" | grep -o '[A-F0-9-]\{36\}' | head -1)
fi

# Hala bulunamazsa herhangi bir iPhone'u kullan
if [ -z "$DEVICE_ID" ]; then
  echo -e "${YELLOW}⚠ Pro Max modeli bulunamadı. Herhangi bir iPhone aranıyor...${NC}"
  DEVICE_ID=$(xcrun simctl list devices available | grep -i "iPhone" | grep -o '[A-F0-9-]\{36\}' | head -1)
fi

if [ -z "$DEVICE_ID" ]; then
  echo -e "${YELLOW}⚠ iPhone simulator bulunamadı. Expo otomatik olarak bir simulator seçecektir.${NC}"
  xcrun simctl list devices available | grep -i "iPhone" | head -5
else
  DEVICE_NAME=$(xcrun simctl list devices available | grep "$DEVICE_ID" | sed 's/.*(\(.*\)).*/\1/' | head -1)
  echo -e "${GREEN}✓ Simulator bulundu: ${DEVICE_NAME} (${DEVICE_ID})${NC}"
fi

# Backend'in çalışıp çalışmadığını kontrol et
echo -e "${YELLOW}🔍 Backend kontrol ediliyor (localhost:${API_PORT})...${NC}"
BACKEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${API_PORT}/swagger" 2>/dev/null || echo "000")
if [ "$BACKEND_CHECK" = "200" ] || [ "$BACKEND_CHECK" = "301" ] || [ "$BACKEND_CHECK" = "302" ]; then
  echo -e "${GREEN}✓ Backend çalışıyor (localhost:${API_PORT})${NC}"
elif curl -s "http://localhost:${API_PORT}/api" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend çalışıyor (localhost:${API_PORT})${NC}"
else
  echo -e "${RED}❌ Backend çalışmıyor! (localhost:${API_PORT})${NC}"
  echo -e "${RED}   Backend'i başlatmak için:${NC}"
  echo -e "${YELLOW}   1. Başka bir terminal açın${NC}"
  echo -e "${YELLOW}   2. Şu komutu çalıştırın:${NC}"
  echo -e "${GREEN}      cd $(dirname "$0")/../.. && ./scripts/start-backend.sh${NC}"
  echo -e "${YELLOW}   3. Backend başladıktan sonra bu script'i tekrar çalıştırın${NC}"
  echo ""
  echo -e "${YELLOW}Devam etmek için Enter'a basın (backend olmadan çalışmayacak) veya Ctrl+C ile iptal edin...${NC}"
  read
fi

# API Base URL'i ayarla (iOS Simulator için HER ZAMAN localhost)
# iOS Simulator Mac IP'sine erişemez, bu yüzden localhost kullanmalıyız
API_HOST="localhost"
export EXPO_PUBLIC_API_BASE_URL="http://${API_HOST}:${API_PORT}"
export EXPO_PUBLIC_API_PORT="${API_PORT}"
export EXPO_PUBLIC_API_HOST="${API_HOST}"
echo -e "${GREEN}✓ API Base URL: ${EXPO_PUBLIC_API_BASE_URL}${NC}"
echo -e "${GREEN}✓ API Port: ${API_PORT}${NC}"
echo -e "${GREEN}✓ API Host: ${API_HOST} (iOS Simulator için zorunlu)${NC}"
echo -e "${YELLOW}ℹ Backend'in ${API_HOST}:${API_PORT} adresinde çalıştığından emin olun!${NC}"

# Mobile dizinine git
cd "$(dirname "$0")/.."

# Node modules kontrolü
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 node_modules bulunamadı. npm install çalıştırılıyor...${NC}"
  npm install
fi

# Expo'yu iOS simulator'de başlat
echo -e "${GREEN}🎯 Expo iOS simulator başlatılıyor...${NC}"
echo -e "${YELLOW}Not: Expo otomatik olarak bir iOS simulator açacaktır.${NC}"
echo -e "${YELLOW}iPhone 17 Pro Max'i manuel olarak seçmek için Xcode > Window > Devices and Simulators${NC}"

# iPhone 17 Pro Max varsa onu kullan, yoksa Expo'nun otomatik seçimine bırak
if [ -n "$DEVICE_ID" ]; then
  # Simulator'ü başlat
  echo -e "${YELLOW}📱 iPhone 17 Pro Max simulator'ü başlatılıyor...${NC}"
  xcrun simctl boot "$DEVICE_ID" 2>/dev/null || echo -e "${YELLOW}⚠ Simulator zaten çalışıyor olabilir${NC}"
  # Simulator'ün açılması için kısa bir bekleme
  sleep 2
  # Expo'yu başlat (Expo otomatik olarak açık simulator'ü kullanacak)
  npx expo start --ios
else
  # Expo otomatik seçim yapsın
  echo -e "${YELLOW}📱 Expo otomatik olarak bir iOS simulator seçecek...${NC}"
  npx expo start --ios
fi
