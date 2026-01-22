#!/usr/bin/env bash
set -euo pipefail

APISIX_ADMIN_URL="${APISIX_ADMIN_URL:-http://localhost:9180}"
APISIX_ADMIN_KEY="${APISIX_ADMIN_KEY:-CHANGE_ME_APISIX_ADMIN_KEY}"
UPSTREAM_HOST="${UPSTREAM_HOST:-host.docker.internal}"
UPSTREAM_PORT="${UPSTREAM_PORT:-5000}"
OIDC_DISCOVERY="${OIDC_DISCOVERY:-http://keycloak:8080/realms/novawallet/.well-known/openid-configuration}"
OIDC_CLIENT_ID="${OIDC_CLIENT_ID:-novawallet-api}"
OIDC_CLIENT_SECRET="${OIDC_CLIENT_SECRET:-novawallet-secret}"

set -e

echo "Configuring APISIX OIDC (admin: $APISIX_ADMIN_URL)"

curl -sS -X PUT "${APISIX_ADMIN_URL}/apisix/admin/routes/1100" \
  -H "X-API-KEY: ${APISIX_ADMIN_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"novawallet-api-oidc\",
    \"uri\": \"/api/*\",
    \"priority\": 2,
    \"plugins\": {
      \"openid-connect\": {
        \"discovery\": \"${OIDC_DISCOVERY}\",
        \"client_id\": \"${OIDC_CLIENT_ID}\",
        \"client_secret\": \"${OIDC_CLIENT_SECRET}\",
        \"bearer_only\": true,
        \"scope\": \"openid profile email\"
      }
    },
    \"upstream\": {
      \"type\": \"roundrobin\",
      \"nodes\": {
        \"${UPSTREAM_HOST}:${UPSTREAM_PORT}\": 1
      }
    }
  }" > /dev/null

echo "APISIX OIDC route configured."
