import { WEAPONS } from "../data/weapons";
import {
  MODIFIER_UPGRADES,
  STAT_UPGRADES,
  weaponBoostOption,
  weaponUpgradeOption,
} from "../data/upgrades";
import type { RunModifiers, UpgradeOption, WeaponId } from "../types";
import { clamp } from "../utils/math";

type UpgradeContext = {
  ownedWeapons: Set<WeaponId>;
  modifiers: RunModifiers;
  luck: number;
};

export class UpgradeSystem {
  generateChoices(context: UpgradeContext, forceRare = false): UpgradeOption[] {
    const choiceCount = forceRare || Math.random() < 0.1 + context.luck ? 4 : 3;
    const choices: UpgradeOption[] = [];
    const seen = new Set<string>();

    while (choices.length < choiceCount) {
      const option = choices.length === 3 ? this.pickRare(context) : this.pickStandard(context);
      if (seen.has(option.id)) {
        continue;
      }
      seen.add(option.id);
      choices.push(option);
    }

    return choices;
  }

  private pickStandard(context: UpgradeContext): UpgradeOption {
    const ownedWeapons = [...context.ownedWeapons];
    const missingWeapons = (Object.keys(WEAPONS) as WeaponId[]).filter(
      (weaponId) => !context.ownedWeapons.has(weaponId),
    );
    const newWeaponChance = clamp(0.35 - ownedWeapons.length * 0.06, 0.08, 0.35);

    if (missingWeapons.length > 0 && Math.random() < newWeaponChance) {
      return weaponUpgradeOption(Phaser.Utils.Array.GetRandom(missingWeapons));
    }

    if (ownedWeapons.length > 0 && Math.random() < 0.34) {
      return weaponBoostOption(Phaser.Utils.Array.GetRandom(ownedWeapons));
    }

    const availableModifiers = MODIFIER_UPGRADES.filter((option) => {
      if (option.modifier === "twinOrbit" && !context.ownedWeapons.has("whirlwind")) {
        return false;
      }

      if (!option.modifier) {
        return true;
      }
      const value = context.modifiers[option.modifier];
      return typeof value === "number" || !value;
    });

    const pool = Math.random() < 0.22 ? availableModifiers : STAT_UPGRADES;
    return Phaser.Utils.Array.GetRandom(pool);
  }

  private pickRare(context: UpgradeContext): UpgradeOption {
    const rarePool = MODIFIER_UPGRADES.filter((option) => {
      if (option.modifier === "twinOrbit" && !context.ownedWeapons.has("whirlwind")) {
        return false;
      }

      if (!option.modifier) {
        return true;
      }

      const value = context.modifiers[option.modifier];
      return typeof value === "number" || !value;
    });

    return Phaser.Utils.Array.GetRandom(rarePool.length ? rarePool : STAT_UPGRADES);
  }
}
