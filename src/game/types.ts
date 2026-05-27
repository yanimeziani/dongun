export type WeaponId = "bulletBlaster" | "gatling" | "laser" | "shotgun" | "slice" | "whirlwind";
export type EnemyKind = "normal" | "fast" | "magic9ball" | "brute" | "shooter";
export type Rarity = "common" | "rare" | "legendary";
export type WeaponBehavior =
  | "singleProjectile"
  | "piercingProjectile"
  | "spreadProjectile"
  | "slice"
  | "orbitHitbox";

export type WeaponData = {
  id: WeaponId;
  name: string;
  rarity: Rarity;
  cooldownMs: number;
  baseDamage: number;
  projectileSpeed?: number;
  range?: number;
  pellets?: number;
  spread?: number;
  behavior: WeaponBehavior;
  color: number;
};

export type PlayerStats = {
  maxHp: number;
  moveSpeed: number;
  fireRate: number;
  damage: number;
  pickupRadius: number;
  luck: number;
  armor: number;
  goldGain: number;
  projectileSize: number;
  projectileSpeed: number;
};

export type RunModifiers = {
  bonusProjectiles: number;
  backBlast: boolean;
  waveShots: boolean;
  chainReaction: boolean;
  twinOrbit: boolean;
};

export type UpgradeType = "weapon" | "stat" | "modifier" | "weaponBoost" | "special";

export type UpgradeOption = {
  id: string;
  name: string;
  description: string;
  type: UpgradeType;
  rarity: Rarity;
  icon: string;
  stat?: keyof PlayerStats;
  statDelta?: number;
  weaponId?: WeaponId;
  modifier?: keyof RunModifiers;
};

export type SaveData = {
  totalGold: number;
  spentGold: number;
  upgrades: Record<string, number>;
  bestSurvivalTime: number;
  totalRuns: number;
};

export type RunResults = {
  survivalSeconds: number;
  kills: number;
  goldEarned: number;
  level: number;
};
