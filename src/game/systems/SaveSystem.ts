import { PERMANENT_UPGRADES, getUpgradeCost } from "../data/permanentUpgrades";
import type { RunResults, SaveData } from "../types";

const STORAGE_KEY = "dongun:vibe-survivors:save";

const DEFAULT_SAVE: SaveData = {
  totalGold: 0,
  spentGold: 0,
  upgrades: {},
  bestSurvivalTime: 0,
  totalRuns: 0,
};

export class SaveSystem {
  static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return structuredClone(DEFAULT_SAVE);
      }

      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        ...structuredClone(DEFAULT_SAVE),
        ...parsed,
        upgrades: parsed.upgrades ?? {},
      };
    } catch {
      return structuredClone(DEFAULT_SAVE);
    }
  }

  static save(save: SaveData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  }

  static recordRun(results: RunResults) {
    const save = SaveSystem.load();
    save.totalGold += results.goldEarned;
    save.bestSurvivalTime = Math.max(save.bestSurvivalTime, results.survivalSeconds);
    save.totalRuns += 1;
    SaveSystem.save(save);
    return save;
  }

  static purchase(upgradeId: string) {
    const save = SaveSystem.load();
    const upgrade = PERMANENT_UPGRADES.find((entry) => entry.id === upgradeId);
    if (!upgrade) {
      return { ok: false, save };
    }

    const currentLevel = save.upgrades[upgrade.id] ?? 0;
    if (currentLevel >= upgrade.maxLevel) {
      return { ok: false, save };
    }

    const cost = getUpgradeCost(upgrade, currentLevel);
    if (save.totalGold < cost) {
      return { ok: false, save };
    }

    save.totalGold -= cost;
    save.spentGold += cost;
    save.upgrades[upgrade.id] = currentLevel + 1;
    SaveSystem.save(save);
    return { ok: true, save };
  }
}
