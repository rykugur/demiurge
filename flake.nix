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
                exec ${pkgs.opentofu}/bin/tofu -chdir=infrastructure/tofu "$@"
              '')

              pkgs.fluxcd
              pkgs.sops
              pkgs.talosctl
            ];
          };
        };
    };
}
