{
  description = "A flake.";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
  };

  outputs =
    inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];

      perSystem =
        { pkgs, ... }:
        {
          devShells.default = pkgs.mkShell {
            buildInputs = [
              pkgs.bun
              pkgs.nodejs
              pkgs.nodePackages.node-gyp
              pkgs.python3
              pkgs.gcc
              pkgs.gnumake

              (pkgs.writeShellScriptBin "tofu" ''
                #!/usr/bin/env bash
                # Wrapped tofu with sops decryption and state passphrase injection
                set -euo pipefail

                REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo "$PWD")"
                TFVARS="$REPO_ROOT/infra/terraform.sops.tfvars"

                if [ -f "$TFVARS" ]; then
                  export TF_VAR_state_passphrase
                  TF_VAR_state_passphrase="$(sops -d "$TFVARS" | grep state_passphrase | sed 's/.*= *"\(.*\)"/\1/')"
                  exec sops exec-file "$TFVARS" "${pkgs.opentofu}/bin/tofu -chdir=infra $* -var-file={}"
                else
                  exec ${pkgs.opentofu}/bin/tofu -chdir=infra "$@"
                fi
              '')

              pkgs.fluxcd
              pkgs.sops
              pkgs.talosctl
            ];
          };
        };
    };
}
