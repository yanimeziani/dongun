export type EnemyData = {
  name: string;
  hp: number;
  speed: number;
  damage: number;
  xpDrop: number;
  goldChance: number;
  goldValue: number;
  radius: number;
  color: number;
  unlockSeconds: number;
};

export const ENEMY_TYPES = {
  normal: {
    name: "Cursed Mite",
    hp: 10,
    speed: 80,
    damage: 9,
    xpDrop: 2,
    goldChance: 0.35,
    goldValue: 1,
    radius: 19,
    color: 0xff4d6d,
    unlockSeconds: 0,
  },
  fast: {
    name: "Needle Skitter",
    hp: 7,
    speed: 140,
    damage: 6,
    xpDrop: 1,
    goldChance: 0.06,
    goldValue: 1,
    radius: 13,
    color: 0xff8a3d,
    unlockSeconds: 45,
  },
  magic9ball: {
    name: "Magic 9-Ball",
    hp: 24,
    speed: 88,
    damage: 12,
    xpDrop: 2,
    goldChance: 0.2,
    goldValue: 2,
    radius: 22,
    color: 0x4de6ff,
    unlockSeconds: 80,
  },
  brute: {
    name: "Ballzhead",
    hp: 64,
    speed: 42,
    damage: 22,
    xpDrop: 5,
    goldChance: 0.35,
    goldValue: 4,
    radius: 44,
    color: 0xa678ff,
    unlockSeconds: 100,
  },
  shooter: {
    name: "Spit Lantern",
    hp: 18,
    speed: 66,
    damage: 8,
    xpDrop: 2,
    goldChance: 0.15,
    goldValue: 2,
    radius: 18,
    color: 0x4de6ff,
    unlockSeconds: 155,
  },
  boss: {
    name: "Dread Ballzhead",
    hp: 900,
    speed: 58,
    damage: 30,
    xpDrop: 30,
    goldChance: 1,
    goldValue: 18,
    radius: 74,
    color: 0xff4d6d,
    // Never selected by the random spawner — summoned manually at milestones.
    unlockSeconds: Number.POSITIVE_INFINITY,
  },
} as const;
