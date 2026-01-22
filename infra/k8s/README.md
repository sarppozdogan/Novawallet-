# Kubernetes

Apply base app:

```bash
kubectl apply -k infra/k8s/base
```

Apply platform services:

```bash
kubectl apply -k infra/k8s/platform
```

Argo CD:

```bash
kubectl apply -f infra/k8s/argocd/namespace.yaml
# Install Argo CD, then:
kubectl apply -f infra/k8s/argocd/novawallet-app.yaml
```
