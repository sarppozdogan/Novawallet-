#!/bin/bash

# iOS Simulator için NovaWallet uygulamasını çalıştırma scripti
# iPhone 17 Pro Max simulator'ünde çalıştırır

set -e

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# iPhone 17 Pro Max simulator'ünü bul veya oluştur
echo -e "${YELLOW}📱 iPhone 17 Pro Max simulator'ü kontrol ediliyor...${NC}"

# Önce mevcut simulator'leri listele
DEVICE_ID=$(xcrun simctl list devices available | grep -i "iPhone 17 Pro Max" | grep -o '[A-F0-9-]\{36\}' | head -1)

if [ -z "$DEVICE_ID" ]; then
  echo -e "${YELLOW}⚠ iPhone 17 Pro Max bulunamadı. Mevcut iPhone simulator'lerini listeliyorum...${NC}"
  xcrun simctl list devices available | grep -i "iPhone" | head -5
  echo -e "${YELLOW}Lütfen mevcut bir iPhone simulator seçin veya iPhone 17 Pro Max'i Xcode'dan oluşturun.${NC}"
  echo -e "${YELLOW}Alternatif olarak, Expo otomatik olarak bir simulator seçecektir.${NC}"
else
  echo -e "${GREEN}✓ iPhone 17 Pro Max bulundu: ${DEVICE_ID}${NC}"
fi

# Backend'in çalışıp çalışmadığını kontrol et
echo -e "${YELLOW}🔍 Backend kontrol ediliyor...${NC}"
if curl -s http://localhost:5000/swagger > /dev/null 2>&1 || curl -s http://localhost:5000/api > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend çalışıyor (localhost:5000)${NC}"
else
  echo -e "${RED}⚠ Backend çalışmıyor görünüyor. Lütfen backend'i başlatın:${NC}"
  echo -e "${YELLOW}  cd ../.. && dotnet run --project src/NovaWallet.API --urls http://localhost:5000${NC}"
  echo -e "${YELLOW}Devam etmek için Enter'a basın veya Ctrl+C ile iptal edin...${NC}"
  read
fi

# API Base URL'i ayarla
export EXPO_PUBLIC_API_BASE_URL="http://${MAC_IP}:5000"
echo -e "${GREEN}✓ API Base URL: ${EXPO_PUBLIC_API_BASE_URL}${NC}"

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
  xcrun simctl boot "$DEVICE_ID" 2>/dev/null || true
  # Expo'yu belirli device ile başlat
  npx expo start --ios --device "$DEVICE_ID"
else
  # Expo otomatik seçim yapsın
  npx expo start --ios
fi
