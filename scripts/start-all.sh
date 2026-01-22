#!/bin/bash

# Backend ve Frontend'i birlikte başlatma scripti

set -e

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   NovaWallet Development Environment  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Proje root dizinine git
cd "$(dirname "$0")/.."

# Backend'i arka planda başlat
echo -e "${GREEN}🚀 Backend başlatılıyor...${NC}"
./scripts/start-backend.sh &
BACKEND_PID=$!

# Backend'in başlaması için biraz bekle
echo -e "${YELLOW}⏳ Backend'in başlaması için 5 saniye bekleniyor...${NC}"
sleep 5

# Frontend'i başlat
echo -e "${GREEN}📱 Frontend başlatılıyor...${NC}"
cd mobile
./scripts/run-ios.sh &
FRONTEND_PID=$!

# Process'leri izle
echo -e "${GREEN}✓ Backend ve Frontend başlatıldı${NC}"
echo -e "${YELLOW}Backend PID: ${BACKEND_PID}${NC}"
echo -e "${YELLOW}Frontend PID: ${FRONTEND_PID}${NC}"
echo ""
echo -e "${BLUE}Durdurmak için Ctrl+C'ye basın${NC}"

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}🛑 Servisler durduruluyor...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Process'leri bekle
wait
