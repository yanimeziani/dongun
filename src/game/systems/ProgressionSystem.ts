import { PERMANENT_UPGRADES } from "../data/permanentUpgrades";
import type { PlayerStats, SaveData } from "../types";

export const BASE_PLAYER_STATS: PlayerStats = {
  maxHp: 120,
  moveSpeed: 220,
  fireRate: 1,
  damage: 1,
  pickupRadius: 125,
  luck: 0,
  armor: 0,
  goldGain: 1,
  projectileSize: 1,
  projectileSpeed: 1,
};

export class ProgressionSystem {
  static statsFromSave(save: SaveData): PlayerStats {
    const stats = { ...BASE_PLAYER_STATS };

    for (const upgrade of PERMANENT_UPGRADES) {
      const level = save.upgrades[upgrade.id] ?? 0;
      const value = level * upgrade.perLevel;

      if (upgrade.stat === "fireRate" || upgrade.stat === "damage" || upgrade.stat === "goldGain") {
        stats[upgrade.stat] += value;
      } else {
        stats[upgrade.stat] += value;
      }
    }

    return stats;
  }
}
