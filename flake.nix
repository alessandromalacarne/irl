{
  description = "Shorl dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs, nixpkgs-unstable }:
    let
      system = "x86_64-linux";

      pkgs = import nixpkgs {
        inherit system;
        overlays = [
          (final: prev: {
            unstable = import nixpkgs-unstable { inherit system; };
          })
        ];
      };
    in {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs =
          [ pkgs.typescript pkgs.gitflow pkgs.unstable.awscli2 pkgs.nodejs ];

        shellHook = ''
          echo "Welcome to Shorl!"
        '';
      };
    };
}
