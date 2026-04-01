#!/usr/bin/env bash
# Wrapper for tofu that decrypts sops-encrypted tfvars and sets the
# state encryption passphrase automatically.
#
# Usage: ./scripts/tofu.sh plan
#        ./scripts/tofu.sh apply
#        ./scripts/tofu.sh <any tofu subcommand>
set -euo pipefail

TFVARS="infra/terraform.sops.tfvars"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TFVARS_PATH="${REPO_ROOT}/${TFVARS}"

export TF_VAR_state_passphrase
TF_VAR_state_passphrase="$(sops -d "$TFVARS_PATH" | grep state_passphrase | sed 's/.*= *"\(.*\)"/\1/')"

sops exec-file "$TFVARS_PATH" "tofu $* -var-file={}"
