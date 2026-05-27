# Dongun Runtime Assets

Drop generated PNGs here after using the prompts in `docs/ASSETS.md`.

Recommended first-pass structure:

```text
public/assets/sprites/player_default_128.png
public/assets/sprites/enemy_crawler_64.png
public/assets/sprites/enemy_swarmling_48.png
public/assets/sprites/enemy_brute_128.png
public/assets/sprites/enemy_spitter_64.png
public/assets/sprites/proj_bullet_32.png
public/assets/sprites/vfx_slice_96.png
public/assets/sprites/vfx_whirlwind_blade_64.png
public/assets/sprites/loot_xp_small_24.png
public/assets/sprites/loot_gold_coin_24.png
public/assets/sprites/loot_heart_32.png
public/assets/sprites/loot_chest_closed_64.png
public/assets/sprites/marker_goldshrine_96.png
```

Run `npm run assets:static` to cut the current Dongun player and gold-shrine sheets into runtime sprites, then run `npm run assets:manifest` after adding manifest-driven files. The game loads player art through the manifest and loads the gold shrine directly during boot.
