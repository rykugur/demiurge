# Infrastructure

OpenTofu configuration for provisioning Demiurge Kubernetes cluster on Proxmox.

## Quick Start

### 1. Configure Secrets

```bash
cd infra
cp terraform.tfvars.example terraform.sops.tfvars
# Edit with your actual values
sops -e terraform.sops.tfvars > tmp && mv tmp terraform.sops.tfvars
```

### 2. Initialize and Apply

```bash
# Use the helper script (auto-decrypts and sets passphrase)
../scripts/tofu.sh init
../scripts/tofu.sh plan
../scripts/tofu.sh apply
```

Or manually:
```bash
# Decrypt and export passphrase
export TF_VAR_state_passphrase=$(sops -d terraform.sops.tfvars | grep state_passphrase | sed 's/.*= *"\(.*\)"/\1/')
sops exec-file terraform.sops.tfvars "tofu $* -var-file={}"
```

### 3. Access Cluster

```bash
# Export kubeconfig
export KUBECONFIG=$(tofu output -raw kubeconfig)

# Or use talosctl
export TALOSCONFIG=$(tofu output -raw talosconfig)
talosctl dashboard
```

### 4. Deploy Demiurge with FluxCD

```bash
# Install Flux
flux install

# Configure GitOps
kubectl apply -f ../clusters/demiurge-cluster/
```

## File Structure

```
infra/
├── versions.tf                # OpenTofu version and encryption config
├── providers.tf               # Provider configuration
├── variables.tf               # Input variables
├── main.tf                    # VM resources and Talos bootstrap
├── images.tf                  # Talos image download
├── outputs.tf                 # Output values
├── terraform.sops.tfvars      # Encrypted secrets (checked in)
├── terraform.tfvars.example   # Example configuration
└── README.md                  # This file

scripts/
└── tofu.sh                    # Helper script

clusters/
└── demiurge-cluster/          # FluxCD configurations
    ├── gotk-sync.yaml
    └── demiurge-kustomization.yaml
```

## Security

- **terraform.sops.tfvars** is encrypted with sops-age using the keys in `.sops.yaml`
- **terraform.tfstate** is encrypted by OpenTofu using the passphrase in tfvars
- **Never commit** unencrypted secrets
- Use `./scripts/tofu.sh` for all tofu operations

## Troubleshooting

See the full deployment guide: `docs/DEPLOYMENT.md`
