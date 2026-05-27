import { WEAPONS } from "./weapons";
import type { RunModifiers, UpgradeOption, WeaponId } from "../types";

export const STAT_UPGRADES: UpgradeOption[] = [
  {
    id: "stat_damage",
    name: "Heavy Rounds",
    description: "+18% weapon damage",
    type: "stat",
    rarity: "common",
    icon: "sword",
    stat: "damage",
    statDelta: 0.18,
  },
  {
    id: "stat_fire_rate",
    name: "Hot Hands",
    description: "+16% fire rate",
    type: "stat",
    rarity: "common",
    icon: "bolt",
    stat: "fireRate",
    statDelta: 0.16,
  },
  {
    id: "stat_move_speed",
    name: "Quick Feet",
    description: "+22 move speed",
    type: "stat",
    rarity: "common",
    icon: "boot",
    stat: "moveSpeed",
    statDelta: 22,
  },
  {
    id: "stat_pickup_radius",
    name: "Long Reach",
    description: "+34 pickup radius",
    type: "stat",
    rarity: "common",
    icon: "magnet",
    stat: "pickupRadius",
    statDelta: 34,
  },
  {
    id: "stat_max_hp",
    name: "Thicker Pulse",
    description: "+18 max HP and heal 18",
    type: "stat",
    rarity: "common",
    icon: "heart",
    stat: "maxHp",
    statDelta: 18,
  },
  {
    id: "stat_armor",
    name: "Soft Armor",
    description: "+2 armor",
    type: "stat",
    rarity: "common",
    icon: "shield",
    stat: "armor",
    statDelta: 2,
  },
  {
    id: "stat_projectile_size",
    name: "Fat Sparks",
    description: "+18% projectile size",
    type: "stat",
    rarity: "rare",
    icon: "orb",
    stat: "projectileSize",
    statDelta: 0.18,
  },
  {
    id: "stat_projectile_speed",
    name: "Rail Wind",
    description: "+15% projectile speed",
    type: "stat",
    rarity: "common",
    icon: "wind",
    stat: "projectileSpeed",
    statDelta: 0.15,
  },
];

export const MODIFIER_UPGRADES: UpgradeOption[] = [
  {
    id: "mod_bonus_projectiles",
    name: "Split Spark",
    description: "+1 projectile on ranged weapons",
    type: "modifier",
    rarity: "rare",
    icon: "triple",
    modifier: "bonusProjectiles",
  },
  {
    id: "mod_back_blast",
    name: "Back Blast",
    description: "Duplicate ranged shots behind you",
    type: "modifier",
    rarity: "rare",
    icon: "mirror",
    modifier: "backBlast",
  },
  {
    id: "mod_wave_shots",
    name: "Wormie Trajectory",
    description: "Ranged shots wiggle through crowds",
    type: "modifier",
    rarity: "rare",
    icon: "wave",
    modifier: "waveShots",
  },
  {
    id: "mod_chain_reaction",
    name: "Chain Reaction",
    description: "Some kills burst for area damage",
    type: "special",
    rarity: "legendary",
    icon: "burst",
    modifier: "chainReaction",
  },
  {
    id: "mod_twin_orbit",
    name: "Twin Orbit",
    description: "Whirlwind gains a second blade",
    type: "special",
    rarity: "legendary",
    icon: "orbit",
    modifier: "twinOrbit",
  },
];

export function weaponUpgradeOption(weaponId: WeaponId): UpgradeOption {
  const weapon = WEAPONS[weaponId];
  return {
    id: `weapon_${weapon.id}`,
    name: `Add ${weapon.name}`,
    description: weapon.behavior === "orbitHitbox" ? "Defensive orbit damage" : "Adds a new auto-attack",
    type: "weapon",
    rarity: weapon.rarity,
    icon: weapon.id,
    weaponId,
  };
}

export function weaponBoostOption(weaponId: WeaponId): UpgradeOption {
  const weapon = WEAPONS[weaponId];
  return {
    id: `boost_${weapon.id}`,
    name: `${weapon.name} Tune-Up`,
    description: "+20% damage and faster cooldown",
    type: "weaponBoost",
    rarity: "common",
    icon: weapon.id,
    weaponId,
  };
}

export const MODIFIER_DEFAULTS: RunModifiers = {
  bonusProjectiles: 0,
  backBlast: false,
  waveShots: false,
  chainReaction: false,
  twinOrbit: false,
};
