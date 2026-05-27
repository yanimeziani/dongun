export type RuntimeAsset = {
  key: string;
  filename: string;
  fallback: "player" | "enemy" | "projectile" | "slice" | "whirlwind" | "loot" | "chest";
};

export const RUNTIME_ASSETS: RuntimeAsset[] = [
  { key: "player", filename: "player_default_128.png", fallback: "player" },
  { key: "enemy-normal", filename: "enemy_crawler_64.png", fallback: "enemy" },
  { key: "enemy-fast", filename: "enemy_swarmling_48.png", fallback: "enemy" },
  { key: "enemy-brute", filename: "enemy_brute_128.png", fallback: "enemy" },
  { key: "enemy-shooter", filename: "enemy_spitter_64.png", fallback: "enemy" },
  { key: "projectile", filename: "proj_bullet_32.png", fallback: "projectile" },
  { key: "slice", filename: "vfx_slice_96.png", fallback: "slice" },
  { key: "whirlwind", filename: "vfx_whirlwind_blade_64.png", fallback: "whirlwind" },
  { key: "loot-xp", filename: "loot_xp_small_24.png", fallback: "loot" },
  { key: "loot-gold", filename: "loot_gold_coin_24.png", fallback: "loot" },
  { key: "loot-heal", filename: "loot_heart_32.png", fallback: "loot" },
  { key: "loot-chest", filename: "loot_chest_closed_64.png", fallback: "chest" },
];

export type RuntimeAssetManifest = Record<string, string>;
