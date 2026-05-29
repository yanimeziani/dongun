import Phaser from "phaser";
import { WEAPONS } from "../data/weapons";
import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { Projectile } from "../entities/Projectile";
import type { WeaponData, WeaponId } from "../types";
import { arcCircleOverlap, hitboxesOverlap, sweepCircleHitTime, type CircleHitbox } from "./HitboxSystem";

type WeaponRuntime = {
  nextFireAt: number;
  orbitBlades: Phaser.GameObjects.Image[];
  lastOrbitDamageCenters: CircleHitbox[];
  lastOrbitDamageAt: number;
};

const VIEWPORT_ATTACK_PADDING = 42;
const MIN_VISIBLE_PROJECTILE_RANGE = 96;
const SLICE_HALF_ANGLE = 0.95;
const ORBIT_BLADE_HIT_RADIUS = 30;

export class WeaponSystem {
  private runtimes = new Map<WeaponId, WeaponRuntime>();

  constructor(
    private scene: Phaser.Scene,
    private projectiles: Phaser.Physics.Arcade.Group,
    private enemies: Phaser.Physics.Arcade.Group,
  ) {}

  ensureWeapon(weaponId: WeaponId) {
    if (!this.runtimes.has(weaponId)) {
      this.runtimes.set(weaponId, {
        nextFireAt: 0,
        orbitBlades: [],
        lastOrbitDamageCenters: [],
        lastOrbitDamageAt: 0,
      });
    }
  }

  update(time: number, deltaSeconds: number, player: Player) {
    for (const weaponId of player.ownedWeapons) {
      this.ensureWeapon(weaponId);
      const weapon = WEAPONS[weaponId];
      const runtime = this.runtimes.get(weaponId)!;

      if (weapon.behavior === "orbitHitbox") {
        this.updateOrbitWeapon(time, deltaSeconds, player, weapon, runtime);
        continue;
      }

      const cooldown = weapon.cooldownMs / Math.max(0.25, player.stats.fireRate);
      if (time < runtime.nextFireAt) {
        continue;
      }

      runtime.nextFireAt = time + cooldown;
      const angle = player.lastAimAngle;

      if (weapon.behavior === "slice") {
        this.fireSlice(player, angle, weapon);
      } else {
        this.fireProjectileWeapon(player, angle, weapon);
      }
    }
  }

  private fireProjectileWeapon(player: Player, angle: number, weapon: WeaponData) {
    const weaponLevel = player.weaponLevels[weapon.id] ?? 1;
    const baseDamage = weapon.baseDamage * player.stats.damage * (1 + (weaponLevel - 1) * 0.2);
    const projectiles = 1 + player.modifiers.bonusProjectiles + Math.max(0, (weapon.pellets ?? 1) - 1);
    const spread = weapon.spread ?? (weapon.id === "gatling" ? 0.22 : 0.08);
    const speed = (weapon.projectileSpeed ?? 420) * player.stats.projectileSpeed;
    const range = weapon.range ?? 720;
    const centerOffset = (projectiles - 1) / 2;
    const homing = weapon.behavior === "homingProjectile";

    for (let i = 0; i < projectiles; i += 1) {
      const offset = (i - centerOffset) * spread;
      const randomJitter = weapon.id === "gatling" ? Phaser.Math.FloatBetween(-0.13, 0.13) : 0;
      // Missiles fan out, then curve back onto targets, so launch them wide.
      const launchAngle = homing ? angle + (i - centerOffset) * 0.5 + randomJitter : angle + offset + randomJitter;
      const lifespan = homing ? 2400 : (this.rangeInsideViewport(player, launchAngle, range) / speed) * 1000;
      this.spawnProjectile(player, launchAngle, {
        speed,
        damage: baseDamage,
        piercing: weapon.behavior === "piercingProjectile",
        scale: player.stats.projectileSize * (weapon.id === "laser" ? 0.8 : homing ? 1.3 : 1),
        color: weapon.color,
        lifespan,
        wave: !homing && player.modifiers.waveShots,
        homing,
        homingTurnRate: homing ? 5.2 : 0,
      });
    }

    if (player.modifiers.backBlast) {
      const backBlastAngle = angle + Math.PI;
      const lifespan = (this.rangeInsideViewport(player, backBlastAngle, range) / speed) * 1000;
      this.spawnProjectile(player, backBlastAngle, {
        speed,
        damage: baseDamage * 0.75,
        piercing: weapon.behavior === "piercingProjectile",
        scale: player.stats.projectileSize,
        color: weapon.color,
        lifespan,
        wave: player.modifiers.waveShots,
      });
    }
  }

  private spawnProjectile(
    player: Player,
    angle: number,
    config: {
      speed: number;
      damage: number;
      piercing: boolean;
      scale: number;
      color: number;
      lifespan: number;
      wave: boolean;
      homing?: boolean;
      homingTurnRate?: number;
    },
  ) {
    let projectile = this.projectiles.getFirstDead(false) as Projectile | null;
    if (!projectile) {
      projectile = new Projectile(this.scene, player.x, player.y);
      this.projectiles.add(projectile);
    }

    projectile.launch({
      x: player.x + Math.cos(angle) * 28,
      y: player.y + Math.sin(angle) * 28,
      angle,
      ...config,
    });
  }

  private fireSlice(player: Player, angle: number, weapon: WeaponData) {
    const range = weapon.range ?? 110;
    const slash = this.scene.add
      .image(player.x + Math.cos(angle) * range * 0.5, player.y + Math.sin(angle) * range * 0.5, "slice")
      .setRotation(angle)
      .setScale(1.15)
      .setTint(weapon.color)
      .setAlpha(0.86)
      .setDepth(40);

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scale: 1.55,
      duration: 130,
      onComplete: () => slash.destroy(),
    });

    const damage = weapon.baseDamage * player.stats.damage * (1 + ((player.weaponLevels[weapon.id] ?? 1) - 1) * 0.2);

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }

      if (arcCircleOverlap(player.getHurtbox(), angle, range, SLICE_HALF_ANGLE, enemy.getHurtbox())) {
        enemy.damage(damage);
      }
    }
  }

  private updateOrbitWeapon(
    time: number,
    deltaSeconds: number,
    player: Player,
    weapon: WeaponData,
    runtime: WeaponRuntime,
  ) {
    const bladeCount = player.modifiers.twinOrbit ? 2 : 1;
    while (runtime.orbitBlades.length < bladeCount) {
      runtime.orbitBlades.push(this.scene.add.image(player.x, player.y, "whirlwind").setDepth(42).setTint(weapon.color));
    }

    while (runtime.orbitBlades.length > bladeCount) {
      runtime.orbitBlades.pop()?.destroy();
      runtime.lastOrbitDamageCenters.pop();
    }

    const radius = (weapon.range ?? 128) + (player.weaponLevels[weapon.id] ?? 1) * 8;
    const currentCenters: CircleHitbox[] = [];
    for (let i = 0; i < runtime.orbitBlades.length; i += 1) {
      const angle = time / 260 + i * Math.PI;
      const blade = runtime.orbitBlades[i];
      blade.setPosition(player.x + Math.cos(angle) * radius, player.y + Math.sin(angle) * radius);
      blade.setRotation(angle + Math.PI / 2);
      currentCenters.push({
        x: blade.x,
        y: blade.y,
        radius: ORBIT_BLADE_HIT_RADIUS,
      });
    }

    if (time < runtime.nextFireAt) {
      return;
    }

    runtime.nextFireAt = time + weapon.cooldownMs / Math.max(0.25, player.stats.fireRate);
    const damage =
      weapon.baseDamage * 0.5 * player.stats.damage * (1 + ((player.weaponLevels[weapon.id] ?? 1) - 1) * 0.2);
    const canUsePreviousSweep = runtime.lastOrbitDamageAt > 0 && time - runtime.lastOrbitDamageAt < 500;

    for (const child of this.enemies.getChildren()) {
      const enemy = child as Enemy;
      if (!enemy.active) {
        continue;
      }

      const enemyHitbox = enemy.getHurtbox();
      const touchedByBlade = currentCenters.some((center, index) => {
        const previous = canUsePreviousSweep ? runtime.lastOrbitDamageCenters[index] ?? center : center;
        return (
          hitboxesOverlap(center, enemyHitbox) ||
          sweepCircleHitTime(
            {
              fromX: previous.x,
              fromY: previous.y,
              toX: center.x,
              toY: center.y,
              radius: ORBIT_BLADE_HIT_RADIUS + deltaSeconds * 18,
            },
            enemyHitbox,
          ) !== null
        );
      });

      if (touchedByBlade) {
        enemy.damage(damage);
      }
    }

    runtime.lastOrbitDamageCenters = currentCenters.map((center) => ({ ...center }));
    runtime.lastOrbitDamageAt = time;
  }

  private rangeInsideViewport(player: Player, angle: number, maxRange: number) {
    const muzzleX = player.x + Math.cos(angle) * 28;
    const muzzleY = player.y + Math.sin(angle) * 28;
    const visibleRange = this.distanceToViewportEdge(muzzleX, muzzleY, angle);
    return Phaser.Math.Clamp(Math.min(maxRange, visibleRange), MIN_VISIBLE_PROJECTILE_RANGE, maxRange);
  }

  private distanceToViewportEdge(x: number, y: number, angle: number) {
    const view = this.scene.cameras.main.worldView;
    const left = view.x + VIEWPORT_ATTACK_PADDING;
    const right = view.x + view.width - VIEWPORT_ATTACK_PADDING;
    const top = view.y + VIEWPORT_ATTACK_PADDING;
    const bottom = view.y + view.height - VIEWPORT_ATTACK_PADDING;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let distance = Number.POSITIVE_INFINITY;

    if (dx > 0.0001) {
      distance = Math.min(distance, (right - x) / dx);
    } else if (dx < -0.0001) {
      distance = Math.min(distance, (left - x) / dx);
    }

    if (dy > 0.0001) {
      distance = Math.min(distance, (bottom - y) / dy);
    } else if (dy < -0.0001) {
      distance = Math.min(distance, (top - y) / dy);
    }

    return Number.isFinite(distance) && distance > 0 ? distance : MIN_VISIBLE_PROJECTILE_RANGE;
  }

}
