# Demiurge Cluster Deployment Guide

This guide covers deploying Demiurge to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured to access your cluster
- Docker (for building images)

## Quick Deploy

### 1. Build and Load Image

**Option A: Build locally and load into cluster (for local clusters like k3s/kind):**

```bash
cd apps/demiurge
docker build -t demiurge:deploy .

# For k3s:
sudo k3s ctr images import <(docker save demiurge:deploy)

# For kind:
kind load docker-image demiurge:deploy --name <cluster-name>
```

**Option B: Push to registry:**

```bash
# Tag for your registry
docker tag demiurge:deploy ghcr.io/YOUR_USERNAME/demiurge:latest
docker push ghcr.io/YOUR_USERNAME/demiurge:latest

# Update kustomization to use your image
# Edit k8s/overlays/production/kustomization.yaml
```

### 2. Configure Secrets

Edit `k8s/base/secrets.yaml` and replace placeholder values:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: demiurge-secrets
  namespace: demiurge
type: Opaque
stringData:
  github-token: "ghp_YOUR_ACTUAL_TOKEN_HERE"
  opencode-api-key: "your-opencode-api-key"
```

Or create secret via kubectl:

```bash
kubectl create namespace demiurge
kubectl create secret generic demiurge-secrets \
  --namespace=demiurge \
  --from-literal=github-token="ghp_YOUR_TOKEN" \
  --from-literal=opencode-api-key="YOUR_KEY"
```

### 3. Deploy

```bash
# Deploy with kustomize
kubectl apply -k k8s/base/

# Or with plain kubectl
kubectl apply -f k8s/base/namespace.yaml
kubectl apply -f k8s/base/secrets.yaml
kubectl apply -f k8s/base/pvc.yaml
kubectl apply -f k8s/base/rbac.yaml
kubectl apply -f k8s/base/service.yaml
kubectl apply -f k8s/base/deployment.yaml
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n demiurge

# Check logs
kubectl logs -n demiurge -l app=demiurge -f

# Check services
kubectl get svc -n demiurge

# Port forward for dashboard access
kubectl port-forward -n demiurge svc/demiurge 3000:3000
```

## Configuration

### Environment Variables

Key environment variables (set in deployment.yaml):

- `DEMIURGE_PORT` - Dashboard port (default: 3000)
- `DEMIURGE_HEALTH_PORT` - Health check port (default: 8080)
- `DEMIURGE_LOOP_INTERVAL_MS` - Orchestrator cycle interval (default: 30000)
- `DEMIURGE_DATA_DIR` - Data directory path (default: /data)
- `DEMIURGE_REPO_URL` - Git repository URL
- `DEMIURGE_BRANCH` - Git branch to use
- `DEMIURGE_ENABLED_AGENTS` - Comma-separated list of enabled agents

### Persistent Storage

The deployment uses a PersistentVolumeClaim (`k8s/base/pvc.yaml`) for:
- SQLite database
- Workspaces
- Directives

Default: 10Gi, ReadWriteOnce

### Resource Limits

Default resources (adjust in deployment.yaml):
- Requests: 256Mi memory, 250m CPU
- Limits: 512Mi memory, 500m CPU

## Production Deployment

For production, use overlays:

```bash
kubectl apply -k k8s/overlays/production/
```

This overlay can include:
- Multiple replicas
- Resource adjustments
- Network policies
- Pod disruption budgets
- Ingress configuration

## Troubleshooting

### Pod stuck in Pending

Check PVC:
```bash
kubectl get pvc -n demiurge
kubectl describe pvc demiurge-data -n demiurge
```

### Pod crashing

Check logs:
```bash
kubectl logs -n demiurge deployment/demiurge --previous
```

### Image pull errors

If using local image, ensure it's loaded into the cluster or update image reference to a registry.

## Security Notes

- Secrets are stored in Kubernetes secrets (base64 encoded)
- GitHub token needs repo access for Demiurge to commit changes
- Consider using external secret management (Vault, Sealed Secrets) for production
- The container runs as non-root
- Network policies can restrict egress/ingress as needed

## Post-Deployment

Once deployed:

1. Access dashboard via port-forward or ingress
2. Create directives in the `directives/` directory
3. Monitor logs to see Hadrian process tasks
4. Check agent status in the dashboard

## Updating

To update the deployment:

```bash
# Build new image
docker build -t demiurge:deploy .

# Load into cluster or push to registry

# Restart deployment
kubectl rollout restart deployment/demiurge -n demiurge

# Monitor rollout
kubectl rollout status deployment/demiurge -n demiurge
```
