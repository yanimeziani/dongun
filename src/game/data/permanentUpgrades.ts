import type { PlayerStats } from "../types";

export type PermanentUpgrade = {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  stat: keyof PlayerStats;
  perLevel: number;
  icon: string;
};

export const PERMANENT_UPGRADES: PermanentUpgrade[] = [
  {
    id: "toughSkin",
    name: "Tough Skin",
    description: "+8 max HP per level",
    maxLevel: 10,
    baseCost: 18,
    stat: "maxHp",
    perLevel: 8,
    icon: "heart",
  },
  {
    id: "fasterHands",
    name: "Faster Hands",
    description: "+5% fire rate per level",
    maxLevel: 10,
    baseCost: 22,
    stat: "fireRate",
    perLevel: 0.05,
    icon: "bolt",
  },
  {
    id: "heavyHits",
    name: "Heavy Hits",
    description: "+6% damage per level",
    maxLevel: 10,
    baseCost: 22,
    stat: "damage",
    perLevel: 0.06,
    icon: "sword",
  },
  {
    id: "runnerLegs",
    name: "Runner Legs",
    description: "+10 move speed per level",
    maxLevel: 5,
    baseCost: 26,
    stat: "moveSpeed",
    perLevel: 10,
    icon: "boot",
  },
  {
    id: "greedyPocket",
    name: "Greedy Pocket",
    description: "+8% gold per level",
    maxLevel: 10,
    baseCost: 18,
    stat: "goldGain",
    perLevel: 0.08,
    icon: "coin",
  },
  {
    id: "magnetSoul",
    name: "Magnet Soul",
    description: "+18 pickup radius per level",
    maxLevel: 5,
    baseCost: 20,
    stat: "pickupRadius",
    perLevel: 18,
    icon: "magnet",
  },
  {
    id: "luckyTooth",
    name: "Lucky Tooth",
    description: "+2% rare choice chance per level",
    maxLevel: 5,
    baseCost: 28,
    stat: "luck",
    perLevel: 0.02,
    icon: "star",
  },
];

export function getUpgradeCost(upgrade: PermanentUpgrade, level: number) {
  return Math.round(upgrade.baseCost * (level + 1) * (1 + level * 0.35));
}
