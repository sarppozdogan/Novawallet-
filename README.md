# NovaWallet

## iOS Simulator'de Çalıştırma (iPhone 17 Pro Max)

### Hızlı Başlangıç

Backend ve Frontend'i birlikte başlatmak için:

```bash
./scripts/start-all.sh
```

### Adım Adım

1. **Backend'i Başlat**

```bash
# Docker servislerini başlat
docker compose up -d

# Backend'i başlat
./scripts/start-backend.sh
```

2. **Frontend'i iOS Simulator'de Başlat**

```bash
cd mobile
npm run ios:simulator
```

Script otomatik olarak:
- Mac IP adresini bulur
- Backend bağlantısını kontrol eder
- iPhone 17 Pro Max simulator'ünü bulur
- Expo'yu iOS simulator'de başlatır

**Not:** İlk kez çalıştırıyorsanız, `mobile` dizininde `npm install` çalıştırın.

### Detaylı Bilgi

Mobile uygulama için detaylı bilgi: [mobile/README.md](mobile/README.md)

---

## Quickstart (local MVP)

1) Create local env file and set a strong password

```bash
cp .env.example .env
```

2) Start SQL Server container

```bash
docker compose up -d
```

3) Provide connection string (choose one)

Option A - appsettings.Development.json

```bash
cp src/NovaWallet.API/appsettings.Development.json.example src/NovaWallet.API/appsettings.Development.json
```

Option B - user secrets

```bash
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=NovaWalletDb;User Id=sa;Password=NovaWallet!2345;TrustServerCertificate=True;Encrypt=False;" --project src/NovaWallet.API
```

4) Apply migrations

```bash
NOVA_DB_CONNECTION="Server=localhost,1433;Database=NovaWalletDb;User Id=sa;Password=NovaWallet!2345;TrustServerCertificate=True;Encrypt=False;" \
  dotnet ef database update --project src/NovaWallet.Infrastructure --startup-project src/NovaWallet.Infrastructure
```

5) Run API

```bash
dotnet run --project src/NovaWallet.API
```

Notes

- TopUp and Withdraw now require a registered bank account. Use `POST /api/bank-accounts` to create one.

Optional: APISIX API Gateway

1) Start APISIX + etcd

```bash
docker compose up -d apisix etcd
```

2) Start API (HTTP)

```bash
dotnet run --project src/NovaWallet.API --urls http://localhost:5000
```

3) Configure APISIX routes and JWT validation

```bash
APISIX_ADMIN_KEY=CHANGE_ME_APISIX_ADMIN_KEY \
JWT_SECRET=CHANGE_ME_32_CHAR_SECRET_KEY_123456 \
JWT_KEY=novawallet \
./apisix/scripts/bootstrap.sh
```
