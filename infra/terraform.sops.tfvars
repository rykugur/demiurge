# Copy to terraform.sops.tfvars and fill in sensitive values.
# Then encrypt with: sops -e terraform.sops.tfvars > tmp && mv tmp terraform.sops.tfvars
# Do NOT commit unencrypted secrets!

proxmox_api_token = "CHANGEME"
state_passphrase  = "CHANGEME"
