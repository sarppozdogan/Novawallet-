# Argo CD (Kubernetes)

Create namespace:

```bash
kubectl apply -f infra/k8s/argocd/namespace.yaml
```

Install Argo CD using the official manifest (recommended), then apply `infra/k8s/argocd/novawallet-app.yaml`.
