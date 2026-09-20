{
  description = "Irl dev environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-unstable,
    }:
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

      playwrightBrowsers = pkgs.playwright-driver.browsers.override {
        withFirefox = false;
        withWebkit = false;
        withFfmpeg = false;
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        buildInputs = [
          pkgs.typescript
          pkgs.gitflow
          pkgs.unstable.awscli2
          pkgs.nodejs
          playwrightBrowsers
        ];

        shellHook = ''
          export PLAYWRIGHT_BROWSERS_PATH=${playwrightBrowsers}
          export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          echo "Welcome to Irl!"
        '';
      };
    };
}
