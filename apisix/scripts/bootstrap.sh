#!/usr/bin/env bash
set -euo pipefail

APISIX_ADMIN_URL="${APISIX_ADMIN_URL:-http://localhost:9180}"
APISIX_ADMIN_KEY="${APISIX_ADMIN_KEY:-CHANGE_ME_APISIX_ADMIN_KEY}"
JWT_SECRET="${JWT_SECRET:-CHANGE_ME_32_CHAR_SECRET_KEY_123456}"
JWT_KEY="${JWT_KEY:-novawallet}"
UPSTREAM_HOST="${UPSTREAM_HOST:-host.docker.internal}"
UPSTREAM_PORT="${UPSTREAM_PORT:-5000}"

echo "Configuring APISIX (admin: $APISIX_ADMIN_URL)"

curl -sS -X PUT "${APISIX_ADMIN_URL}/apisix/admin/consumers/novawallet" \
  -H "X-API-KEY: ${APISIX_ADMIN_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"novawallet\",
    \"plugins\": {
      \"jwt-auth\": {
        \"key\": \"${JWT_KEY}\",
        \"secret\": \"${JWT_SECRET}\"
      }
    }
  }" > /dev/null

curl -sS -X PUT "${APISIX_ADMIN_URL}/apisix/admin/routes/1001" \
  -H "X-API-KEY: ${APISIX_ADMIN_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"novawallet-auth\",
    \"uri\": \"/api/auth/*\",
    \"priority\": 10,
    \"upstream\": {
      \"type\": \"roundrobin\",
      \"nodes\": {
        \"${UPSTREAM_HOST}:${UPSTREAM_PORT}\": 1
      }
    }
  }" > /dev/null

curl -sS -X PUT "${APISIX_ADMIN_URL}/apisix/admin/routes/1002" \
  -H "X-API-KEY: ${APISIX_ADMIN_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"novawallet-swagger\",
    \"uri\": \"/swagger/*\",
    \"priority\": 9,
    \"upstream\": {
      \"type\": \"roundrobin\",
      \"nodes\": {
        \"${UPSTREAM_HOST}:${UPSTREAM_PORT}\": 1
      }
    }
  }" > /dev/null

curl -sS -X PUT "${APISIX_ADMIN_URL}/apisix/admin/routes/1000" \
  -H "X-API-KEY: ${APISIX_ADMIN_KEY}" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"novawallet-api\",
    \"uri\": \"/api/*\",
    \"priority\": 1,
    \"plugins\": {
      \"jwt-auth\": {}
    },
    \"upstream\": {
      \"type\": \"roundrobin\",
      \"nodes\": {
        \"${UPSTREAM_HOST}:${UPSTREAM_PORT}\": 1
      }
    }
  }" > /dev/null

echo "APISIX routes and consumer configured."
