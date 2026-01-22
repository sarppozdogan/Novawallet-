# Enterprise Stack (Local)

This folder adds a full enterprise-style stack without changing the current app flow/UI.

## Quick start (Docker Compose)

From repo root:

```bash
docker compose -f docker-compose.yml -f infra/compose/enterprise/docker-compose.enterprise.yml up -d
```

Then run the API with optional observability:

```bash
export OBSERVABILITY__OPENTELEMETRY__ENABLED=true
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4319
dotnet run --project src/NovaWallet.API --urls http://localhost:5000
```

## Services (default ports)

- Keycloak: http://localhost:8081
- Redis: localhost:6379
- RabbitMQ: http://localhost:15672 (user/pass: novawallet)
- Kafka: localhost:9092
- ElasticSearch: http://localhost:9200
- Kibana: http://localhost:5601
- Jaeger: http://localhost:16686
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)
- SonarQube: http://localhost:9000
- Jenkins: http://localhost:8082

## Dapr components

`infra/dapr` includes a Redis statestore and RabbitMQ pubsub config for local dev.

## Kubernetes / Helm / IaC

See `infra/k8s`, `infra/helm`, `infra/terraform`, `infra/ansible` for deployment templates.
