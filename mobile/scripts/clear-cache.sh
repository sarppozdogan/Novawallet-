#!/bin/bash

# Expo cache temizleme scripti

set -e

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧹 Expo cache temizleniyor...${NC}"

# Mobile dizinine git
cd "$(dirname "$0")/.."

# Expo cache'i temizle
echo -e "${YELLOW}📦 Expo cache temizleniyor...${NC}"
rm -rf .expo
rm -rf node_modules/.cache
rm -rf .expo-shared

# Watchman cache'i temizle (varsa)
if command -v watchman &> /dev/null; then
  echo -e "${YELLOW}🔍 Watchman cache temizleniyor...${NC}"
  watchman watch-del-all 2>/dev/null || true
fi

# Metro bundler cache'i temizle
echo -e "${YELLOW}📦 Metro bundler cache temizleniyor...${NC}"
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-* 2>/dev/null || true

echo -e "${GREEN}✓ Cache temizlendi!${NC}"
echo -e "${YELLOW}💡 Şimdi 'npm run ios:simulator' komutunu çalıştırın.${NC}"
