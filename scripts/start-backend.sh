#!/bin/bash

# Backend API'yi başlatma scripti

set -e

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 NovaWallet Backend Başlatılıyor...${NC}"

# Proje root dizinine git
cd "$(dirname "$0")/.."

# Docker servislerinin çalışıp çalışmadığını kontrol et
echo -e "${YELLOW}🔍 Docker servisleri kontrol ediliyor...${NC}"
if ! docker ps | grep -q novawallet-sql; then
  echo -e "${YELLOW}⚠ SQL Server container çalışmıyor. Başlatılıyor...${NC}"
  docker compose up -d sqlserver
  echo -e "${YELLOW}⏳ SQL Server'ın başlaması için 10 saniye bekleniyor...${NC}"
  sleep 10
else
  echo -e "${GREEN}✓ SQL Server container çalışıyor${NC}"
fi

# Connection string kontrolü
echo -e "${YELLOW}🔍 Connection string kontrol ediliyor...${NC}"
if [ ! -f "src/NovaWallet.API/appsettings.Development.json" ]; then
  echo -e "${YELLOW}⚠ appsettings.Development.json bulunamadı.${NC}"
  if [ -f "src/NovaWallet.API/appsettings.Development.json.example" ]; then
    echo -e "${YELLOW}Örnek dosyadan kopyalanıyor...${NC}"
    cp src/NovaWallet.API/appsettings.Development.json.example src/NovaWallet.API/appsettings.Development.json
    echo -e "${RED}⚠ Lütfen appsettings.Development.json dosyasındaki ConnectionStrings:DefaultConnection'i düzenleyin!${NC}"
  else
    echo -e "${RED}❌ appsettings.Development.json.example bulunamadı!${NC}"
    exit 1
  fi
fi

# Migrations kontrolü (isteğe bağlı - kullanıcı manuel çalıştırabilir)
echo -e "${YELLOW}💡 Migrations'ları çalıştırmak için:${NC}"
echo -e "${YELLOW}  NOVA_DB_CONNECTION=\"Server=localhost,1433;Database=NovaWalletDb;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;Encrypt=False;\" \\${NC}"
echo -e "${YELLOW}    dotnet ef database update --project src/NovaWallet.Infrastructure --startup-project src/NovaWallet.API${NC}"

# Backend'i başlat (0.0.0.0 tüm network interface'lerinde dinler)
echo -e "${GREEN}🎯 Backend API başlatılıyor (http://0.0.0.0:5000)...${NC}"
echo -e "${YELLOW}💡 Backend'e erişim: http://localhost:5000 veya http://$(ipconfig getifaddr en0 2>/dev/null || echo 'YOUR_IP'):5000${NC}"
cd src/NovaWallet.API
dotnet run --urls http://0.0.0.0:5000
