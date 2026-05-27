import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicAssetsDir = join(process.cwd(), "public", "assets");
const manifestPath = join(publicAssetsDir, "manifest.json");

const runtimeAssets = [
  ["player", "player_default_128.png"],
  ["enemy-normal", "enemy_crawler_64.png"],
  ["enemy-fast", "enemy_swarmling_48.png"],
  ["enemy-brute", "enemy_brute_128.png"],
  ["enemy-shooter", "enemy_spitter_64.png"],
  ["projectile", "proj_bullet_32.png"],
  ["slice", "vfx_slice_96.png"],
  ["whirlwind", "vfx_whirlwind_blade_64.png"],
  ["loot-xp", "loot_xp_small_24.png"],
  ["loot-gold", "loot_gold_coin_24.png"],
  ["loot-heal", "loot_heart_32.png"],
  ["loot-chest", "loot_chest_closed_64.png"],
];

const searchFolders = ["sprites", "ui", "vfx", "loot"];
const manifest = {};

for (const [key, filename] of runtimeAssets) {
  for (const folder of searchFolders) {
    const candidate = join(publicAssetsDir, folder, filename);
    if (existsSync(candidate)) {
      manifest[key] = `assets/${folder}/${filename}`;
      break;
    }
  }
}

await mkdir(publicAssetsDir, { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

console.log(`Wrote ${Object.keys(manifest).length} runtime asset entries to ${manifestPath}`);
