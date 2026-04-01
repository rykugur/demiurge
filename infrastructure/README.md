# Infrastructure Setup

This directory contains OpenTofu (Terraform) configurations for provisioning Demiurge infrastructure.

## Architecture

- **OpenTofu**: Infrastructure as Code for VM provisioning
- **Talos Linux**: Minimal, immutable Kubernetes OS
- **Proxmox**: Virtualization platform (adjust for your environment)
- **FluxCD**: GitOps for Kubernetes application deployment

## Prerequisites

- OpenTofu (or Terraform) >= 1.5
- `talosctl` CLI tool
- `kubectl`
- Access to Proxmox (or alternative virtualization platform)

## Quick Start

### 1. Configure Variables

```bash
cd infrastructure/tofu
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 2. Initialize OpenTofu

```bash
tofu init
```

### 3. Plan & Apply

```bash
# Preview changes
tofu plan

# Apply infrastructure
tofu apply
```

This will:
- Create Talos Linux VMs on Proxmox
- Bootstrap Kubernetes cluster
- Generate kubeconfig

### 4. Access Cluster

```bash
# Export kubeconfig
export KUBECONFIG=$(tofu output -raw kubeconfig)

# Verify
kubectl get nodes
```

### 5. Install FluxCD

```bash
# Install FluxCD
flux install

# Configure GitOps
kubectl apply -f ../../clusters/demiurge-cluster/
```

## Directory Structure

```
infrastructure/
├── tofu/
│   ├── main.tf                  # Main OpenTofu configuration
│   ├── terraform.tfvars.example # Example variables
│   └── modules/
│       └── talos/               # Talos VM module
└── ...

clusters/
└── demiurge-cluster/            # FluxCD configurations
    ├── gotk-sync.yaml           # GitRepository source
    └── demiurge-kustomization.yaml  # App deployment
```

## Customization

### Using Different Virtualization Platform

Replace the Proxmox provider in `main.tf` with your platform:
- VMware vSphere
- AWS/Azure/GCP
- libvirt
- etc.

### Talos Configuration

Modify the `config_patches` in `main.tf` to customize Talos:
- Network configuration
- System extensions
- Kubernetes features

### Node Count

Adjust `control_plane_nodes` and `worker_nodes` in `terraform.tfvars`:
- Minimum: 1 control plane
- HA Setup: 3 control planes
- Scale workers as needed

## Destroy Infrastructure

```bash
tofu destroy
```

## Troubleshooting

### VMs not booting

Check Proxmox console for boot errors. Ensure Talos image downloaded correctly.

### Cluster not forming

Check network connectivity between nodes:
```bash
talosctl --talosconfig <(tofu output -raw talos_config) dashboard
```

### FluxCD not syncing

Check Flux logs:
```bash
flux logs
```

## Resources

- [Talos Linux Docs](https://www.talos.dev/)
- [OpenTofu Docs](https://opentofu.org/docs/)
- [FluxCD Docs](https://fluxcd.io/docs/)
