# APISIX Gateway (Local)

This setup runs Apache APISIX as the API Gateway in front of the NovaWallet API.

## Quickstart

1) Start APISIX + etcd

```bash
docker compose up -d apisix etcd
```

2) Start API (HTTP)

```bash
dotnet run --project src/NovaWallet.API --urls http://localhost:5000
```

3) Configure routes and JWT validation

```bash
APISIX_ADMIN_KEY=CHANGE_ME_APISIX_ADMIN_KEY \
JWT_SECRET=CHANGE_ME_32_CHAR_SECRET_KEY_123456 \
JWT_KEY=novawallet \
./apisix/scripts/bootstrap.sh
```

4) Call APIs via Gateway

```bash
curl http://localhost:9080/api/auth/login
```

## Notes

- The APISIX Admin API listens on port `9180` and Gateway on `9080`.
- Update `JWT_SECRET` and `JWT_KEY` to match `JwtSettings` in `src/NovaWallet.API/appsettings.json`.
- JWT tokens include the `key` claim (GatewayKey) so APISIX can validate them.
- The script creates:
  - `/api/auth/*` without JWT (registration/login)
  - `/api/*` with JWT validation
  - `/swagger/*` without JWT (dev only)
