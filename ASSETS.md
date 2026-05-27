# Dongun Assets

The full image prompt pack lives in [docs/ASSETS.md](docs/ASSETS.md).

Runtime art belongs in `public/assets/`, with generated PNGs usually placed under `public/assets/sprites/` or `public/assets/ui/`.

After adding or replacing PNG files, run:

```sh
npm run assets:manifest
```

The game loads files listed in `public/assets/manifest.json` and falls back to generated placeholder textures for any missing asset.
