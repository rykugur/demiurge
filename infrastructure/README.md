# Infrastructure Setup

OpenTofu configuration for provisioning Demiurge Kubernetes cluster on Proxmox.

## Architecture

- **OpenTofu**: Infrastructure as Code for VM provisioning
- **Talos Linux**: Minimal, immutable Kubernetes OS
- **Proxmox**: Virtualization platform
- **FluxCD**: GitOps for Kubernetes application deployment (in `clusters/`)

## Quick Start

### 1. Configure Variables

```bash
cd infrastructure/tofu
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your Proxmox API token
```

### 2. Initialize and Apply

```bash
# Initialize providers
tofu init

# Preview changes
tofu plan

# Apply infrastructure
tofu apply
```

This will:
- Download Talos Linux image
- Create control plane and worker VMs
- Bootstrap Kubernetes cluster
- Output kubeconfig

### 3. Access Cluster

```bash
# Export kubeconfig
export KUBECONFIG=$(tofu output -raw kubeconfig)

# Verify nodes
kubectl get nodes

# Or use talosctl
export TALOSCONFIG=$(tofu output -raw talosconfig)
talosctl dashboard
```

### 4. Deploy Demiurge with FluxCD

```bash
# Install Flux
flux install

# Configure GitOps
kubectl apply -f ../../clusters/demiurge-cluster/

# Watch deployment
flux get kustomizations --watch
```

## File Structure

```
infrastructure/tofu/
├── main.tf                    # VM resources and Talos bootstrap
├── variables.tf               # Input variables
├── outputs.tf                 # Output values
├── providers.tf               # Provider configuration
├── images.tf                  # Talos image download
├── terraform.tfvars.example   # Example variables
└── README.md                  # This file

clusters/
└── demiurge-cluster/          # FluxCD configurations
    ├── gotk-sync.yaml         # GitRepository source
    └── demiurge-kustomization.yaml
```

## Customization

### Adjust Node Count

Edit `terraform.tfvars`:

```hcl
# Single control plane (minimal)
workers = [
  { vm_id = 201, hostname = "demiurge-worker-01", ip = "192.168.1.201" },
]

# Or add more workers
workers = [
  { vm_id = 201, hostname = "demiurge-worker-01", ip = "192.168.1.201" },
  { vm_id = 202, hostname = "demiurge-worker-02", ip = "192.168.1.202" },
  { vm_id = 203, hostname = "demiurge-worker-03", ip = "192.168.1.203" },
]
```

### Change Resources

```hcl
# Control plane
cp_cpu       = 4
cp_memory    = 8192
cp_disk_size = 50

# Workers
worker_cpu       = 8
worker_memory    = 16384
worker_disk_size = 100
```

### Network Configuration

```hcl
gateway       = "10.0.0.1"
dns_servers   = ["10.0.0.1", "8.8.8.8"]
subnet_prefix = 24
```

## Destroy Infrastructure

```bash
tofu destroy
```

## Troubleshooting

### VMs not booting

Check Proxmox console for boot errors:
```bash
talosctl --talosconfig <(tofu output -raw talosconfig) dashboard
```

### Cluster not forming

Check Talos logs:
```bash
talosctl --talosconfig <(tofu output -raw talosconfig) logs
```

### FluxCD not syncing

```bash
flux logs
kubectl get gitrepositories -A
kubectl get kustomizations -A
```

## Security Notes

- Keep `terraform.tfvars` out of git (it's in .gitignore)
- Use Proxmox API tokens with minimal permissions
- Talos Linux runs with immutable filesystem
- All changes go through GitOps (FluxCD)

## Resources

- [Talos Linux Docs](https://www.talos.dev/)
- [OpenTofu Docs](https://opentofu.org/docs/)
- [FluxCD Docs](https://fluxcd.io/docs/)
- [Proxmox Provider](https://registry.terraform.io/providers/bpg/proxmox/latest/docs)
