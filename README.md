# NovaWallet

Quickstart (local MVP)

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
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=NovaWalletDb;User Id=sa;Password=ChangeThis!2345;TrustServerCertificate=True;Encrypt=False;" --project src/NovaWallet.API
```

4) Apply migrations

```bash
NOVA_DB_CONNECTION="Server=localhost,1433;Database=NovaWalletDb;User Id=sa;Password=ChangeThis!2345;TrustServerCertificate=True;Encrypt=False;" \
  dotnet ef database update --project src/NovaWallet.Infrastructure --startup-project src/NovaWallet.Infrastructure
```

5) Run API

```bash
dotnet run --project src/NovaWallet.API
```
