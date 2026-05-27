import Phaser from "phaser";
import { ENEMY_TYPES, type EnemyData } from "../data/enemies";
import type { CircleHitbox } from "../systems/HitboxSystem";
import type { EnemyKind } from "../types";
import { COLORS, ENEMY_DEPTH } from "../utils/constants";
import { DamageNumberPool } from "../systems/DamageNumberPool";

export type AIPhase = "approach" | "wander" | "flank" | "dash" | "recover" | "orbit" | "lunge" | "telegraph" | "charge" | "strafe" | "aim";

export type AITickContext = {
  player: { x: number; y: number };
  time: number;
  deltaSeconds: number;
  elapsedSeconds: number;
};

export type AITickResult = {
  vx: number;
  vy: number;
  facingAngle: number;
  fireProjectile?: { angle: number };
  aimLine?: { angle: number; length: number };
};

type EnemySpriteKey = "dynoblob" | "spiderswish" | "magic9ball" | "ballzhead";

const ENEMY_SPRITE_SCALE: Record<EnemySpriteKey, number> = {
  dynoblob: 0.3,
  spiderswish: 0.28,
  magic9ball: 0.33,
  ballzhead: 0.42,
};

const ENEMY_HURTBOX_SCALE = 0.92;
const ENEMY_CONTACT_SCALE = 0.78;
const ENEMY_HITBOX_OFFSET_Y = 0.08;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  kind: EnemyKind;
  enemyData: EnemyData;
  hp: number;
  maxHp: number;
  lastContactAt = 0;
  lastShotAt = 0;
  aiPhase: AIPhase = "approach";
  aiPhaseUntil = 0;
  aiNextDecisionAt = 0;
  aiWanderAngle = Math.random() * Math.PI * 2;
  aiStrafeDir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  aiLockedAngle = 0;
  separationVx = 0;
  separationVy = 0;
  private readonly spriteKey?: EnemySpriteKey;
  private shadow?: Phaser.GameObjects.Ellipse;
  private rim?: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: EnemyKind, difficulty: number) {
    const spriteKey =
      kind === "normal" && scene.textures.exists("dynoblob")
        ? "dynoblob"
        : kind === "fast" && scene.textures.exists("spiderswish")
          ? "spiderswish"
          : kind === "magic9ball" && scene.textures.exists("magic9ball")
            ? "magic9ball"
            : kind === "brute" && scene.textures.exists("ballzhead")
              ? "ballzhead"
              : undefined;
    super(scene, x, y, spriteKey ?? `enemy-${kind}`, spriteKey ? 5 : undefined);
    this.kind = kind;
    this.spriteKey = spriteKey;
    this.enemyData = ENEMY_TYPES[kind];
    this.maxHp = Math.round(this.enemyData.hp * difficulty);
    this.hp = this.maxHp;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(ENEMY_DEPTH);
    this.setCircle(this.enemyData.radius);
    if (this.spriteKey) {
      this.setScale(ENEMY_SPRITE_SCALE[this.spriteKey]);
      this.play(`${this.spriteKey}-walk`);
    } else {
      this.setTint(this.enemyData.color);
    }

    const radius = this.enemyData.radius;
    this.shadow = scene.add
      .ellipse(x, y + radius * 0.85, radius * 2.1, radius * 0.7, 0x000000, 0.55)
      .setDepth(ENEMY_DEPTH - 2);
    this.rim = scene.add
      .circle(x, y, radius * 1.35, this.enemyData.color, 0.22)
      .setDepth(ENEMY_DEPTH - 1);
  }

  syncFx() {
    if (this.shadow) {
      this.shadow.setPosition(this.x, this.y + this.enemyData.radius * 0.85);
    }
    if (this.rim) {
      this.rim.setPosition(this.x, this.y);
    }
  }

  getHurtbox(): CircleHitbox {
    return this.makeHitbox(ENEMY_HURTBOX_SCALE);
  }

  getContactHitbox(): CircleHitbox {
    return this.makeHitbox(ENEMY_CONTACT_SCALE);
  }

  destroy(fromScene?: boolean) {
    this.shadow?.destroy();
    this.rim?.destroy();
    this.shadow = undefined;
    this.rim = undefined;
    super.destroy(fromScene);
  }

  faceMovement(angle: number) {
    if (this.spriteKey) {
      this.setRotation(0);
      this.setFlipX(Math.cos(angle) < 0);
      return;
    }

    this.setRotation(angle + Math.PI / 2);
  }

  tickAI(ctx: AITickContext): AITickResult {
    switch (this.kind) {
      case "fast":
        return this.tickFlankerAI(ctx);
      case "magic9ball":
        return this.tickOrbiterAI(ctx);
      case "brute":
        return this.tickChargerAI(ctx);
      case "shooter":
        return this.tickKiterAI(ctx);
      case "normal":
      default:
        return this.tickSwarmerAI(ctx);
    }
  }

  private toPlayerAngle(player: { x: number; y: number }) {
    return Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
  }

  private distanceTo(player: { x: number; y: number }) {
    return Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
  }

  private speedFor(elapsedSeconds: number) {
    return this.enemyData.speed * (1 + elapsedSeconds / 360);
  }

  private tickSwarmerAI(ctx: AITickContext): AITickResult {
    const speed = this.speedFor(ctx.elapsedSeconds);
    const toPlayer = this.toPlayerAngle(ctx.player);

    if (ctx.time >= this.aiNextDecisionAt) {
      this.aiNextDecisionAt = ctx.time + Phaser.Math.Between(400, 900);
      this.aiWanderAngle = toPlayer + (Math.random() - 0.5) * 0.9;
    }

    const blend = 0.78;
    const angle = toPlayer * (1 - blend) + this.aiWanderAngle * blend;
    return {
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      facingAngle: toPlayer,
    };
  }

  private tickFlankerAI(ctx: AITickContext): AITickResult {
    const baseSpeed = this.speedFor(ctx.elapsedSeconds);
    const distance = this.distanceTo(ctx.player);
    const toPlayer = this.toPlayerAngle(ctx.player);

    if (this.aiPhase === "recover") {
      if (ctx.time >= this.aiPhaseUntil) {
        this.aiPhase = "flank";
        this.aiStrafeDir = Math.random() < 0.5 ? 1 : -1;
      }
      return { vx: 0, vy: 0, facingAngle: toPlayer };
    }

    if (this.aiPhase === "dash") {
      if (ctx.time >= this.aiPhaseUntil || distance < 26) {
        this.aiPhase = "recover";
        this.aiPhaseUntil = ctx.time + 320;
        return { vx: 0, vy: 0, facingAngle: this.aiLockedAngle };
      }
      const dashSpeed = baseSpeed * 1.9;
      return {
        vx: Math.cos(this.aiLockedAngle) * dashSpeed,
        vy: Math.sin(this.aiLockedAngle) * dashSpeed,
        facingAngle: this.aiLockedAngle,
      };
    }

    if (distance < 150) {
      this.aiPhase = "dash";
      this.aiLockedAngle = toPlayer;
      this.aiPhaseUntil = ctx.time + 380;
      const dashSpeed = baseSpeed * 1.9;
      return {
        vx: Math.cos(this.aiLockedAngle) * dashSpeed,
        vy: Math.sin(this.aiLockedAngle) * dashSpeed,
        facingAngle: this.aiLockedAngle,
      };
    }

    const flankAngle = toPlayer + this.aiStrafeDir * 0.55;
    return {
      vx: Math.cos(flankAngle) * baseSpeed,
      vy: Math.sin(flankAngle) * baseSpeed,
      facingAngle: toPlayer,
    };
  }

  private tickOrbiterAI(ctx: AITickContext): AITickResult {
    const baseSpeed = this.speedFor(ctx.elapsedSeconds);
    const distance = this.distanceTo(ctx.player);
    const toPlayer = this.toPlayerAngle(ctx.player);
    const ORBIT_RADIUS = 200;

    if (this.aiPhase === "lunge") {
      if (ctx.time >= this.aiPhaseUntil || distance < 28) {
        this.aiPhase = "orbit";
        this.aiNextDecisionAt = ctx.time + Phaser.Math.Between(1800, 3200);
      }
      const lungeSpeed = baseSpeed * 1.55;
      return {
        vx: Math.cos(this.aiLockedAngle) * lungeSpeed,
        vy: Math.sin(this.aiLockedAngle) * lungeSpeed,
        facingAngle: this.aiLockedAngle,
      };
    }

    if (ctx.time >= this.aiNextDecisionAt && distance < 320) {
      this.aiPhase = "lunge";
      this.aiLockedAngle = toPlayer;
      this.aiPhaseUntil = ctx.time + 520;
      this.aiNextDecisionAt = ctx.time + 4000;
      const lungeSpeed = baseSpeed * 1.55;
      return {
        vx: Math.cos(this.aiLockedAngle) * lungeSpeed,
        vy: Math.sin(this.aiLockedAngle) * lungeSpeed,
        facingAngle: this.aiLockedAngle,
      };
    }

    const radialError = distance - ORBIT_RADIUS;
    const radialPull = Phaser.Math.Clamp(radialError / 120, -1, 1);
    const tangent = toPlayer + this.aiStrafeDir * (Math.PI / 2);
    const moveAngle = tangent + radialPull * this.aiStrafeDir * 0.6;

    if (ctx.time >= this.aiNextDecisionAt - 200) {
      // close to lunge window — let it pass
    }

    return {
      vx: Math.cos(moveAngle) * baseSpeed * 0.85,
      vy: Math.sin(moveAngle) * baseSpeed * 0.85,
      facingAngle: toPlayer,
    };
  }

  private tickChargerAI(ctx: AITickContext): AITickResult {
    const baseSpeed = this.speedFor(ctx.elapsedSeconds);
    const distance = this.distanceTo(ctx.player);
    const toPlayer = this.toPlayerAngle(ctx.player);

    if (this.aiPhase === "recover") {
      if (ctx.time >= this.aiPhaseUntil) {
        this.aiPhase = "approach";
      }
      return { vx: 0, vy: 0, facingAngle: this.aiLockedAngle };
    }

    if (this.aiPhase === "telegraph") {
      if (ctx.time >= this.aiPhaseUntil) {
        this.aiPhase = "charge";
        this.aiPhaseUntil = ctx.time + 720;
        this.clearTint();
      }
      return { vx: 0, vy: 0, facingAngle: this.aiLockedAngle };
    }

    if (this.aiPhase === "charge") {
      if (ctx.time >= this.aiPhaseUntil) {
        this.aiPhase = "recover";
        this.aiPhaseUntil = ctx.time + 620;
        return { vx: 0, vy: 0, facingAngle: this.aiLockedAngle };
      }
      const chargeSpeed = baseSpeed * 2.4;
      return {
        vx: Math.cos(this.aiLockedAngle) * chargeSpeed,
        vy: Math.sin(this.aiLockedAngle) * chargeSpeed,
        facingAngle: this.aiLockedAngle,
      };
    }

    if (distance < 260 && ctx.time >= this.aiNextDecisionAt) {
      this.aiPhase = "telegraph";
      this.aiLockedAngle = toPlayer;
      this.aiPhaseUntil = ctx.time + 460;
      this.aiNextDecisionAt = ctx.time + 1600;
      this.setTintFill(0xff5050);
      return { vx: 0, vy: 0, facingAngle: this.aiLockedAngle };
    }

    return {
      vx: Math.cos(toPlayer) * baseSpeed,
      vy: Math.sin(toPlayer) * baseSpeed,
      facingAngle: toPlayer,
    };
  }

  private tickKiterAI(ctx: AITickContext): AITickResult {
    const baseSpeed = this.speedFor(ctx.elapsedSeconds);
    const distance = this.distanceTo(ctx.player);
    const toPlayer = this.toPlayerAngle(ctx.player);
    const STAND_MIN = 280;
    const STAND_MAX = 360;
    const FIRE_COOLDOWN = 1900;
    const AIM_DURATION = 320;

    if (this.aiPhase === "aim") {
      if (ctx.time >= this.aiPhaseUntil) {
        this.aiPhase = "strafe";
        this.lastShotAt = ctx.time;
        return {
          vx: 0,
          vy: 0,
          facingAngle: this.aiLockedAngle,
          fireProjectile: { angle: this.aiLockedAngle },
        };
      }
      return {
        vx: 0,
        vy: 0,
        facingAngle: this.aiLockedAngle,
        aimLine: { angle: this.aiLockedAngle, length: 220 },
      };
    }

    if (ctx.time - this.lastShotAt > FIRE_COOLDOWN && distance < 420 && distance > 120) {
      this.aiPhase = "aim";
      this.aiLockedAngle = toPlayer;
      this.aiPhaseUntil = ctx.time + AIM_DURATION;
      return {
        vx: 0,
        vy: 0,
        facingAngle: this.aiLockedAngle,
        aimLine: { angle: this.aiLockedAngle, length: 220 },
      };
    }

    let radialDir = 0;
    if (distance < STAND_MIN) {
      radialDir = -1;
    } else if (distance > STAND_MAX) {
      radialDir = 1;
    }

    if (ctx.time >= this.aiNextDecisionAt) {
      this.aiNextDecisionAt = ctx.time + Phaser.Math.Between(700, 1400);
      if (Math.random() < 0.35) {
        this.aiStrafeDir = this.aiStrafeDir === 1 ? -1 : 1;
      }
    }

    const tangent = toPlayer + this.aiStrafeDir * (Math.PI / 2);
    const radial = toPlayer + (radialDir < 0 ? Math.PI : 0);
    const blendRadial = radialDir === 0 ? 0 : 0.55;
    const vx = Math.cos(tangent) * baseSpeed * (1 - blendRadial) + (radialDir !== 0 ? Math.cos(radial) * baseSpeed * blendRadial : 0);
    const vy = Math.sin(tangent) * baseSpeed * (1 - blendRadial) + (radialDir !== 0 ? Math.sin(radial) * baseSpeed * blendRadial : 0);

    return {
      vx,
      vy,
      facingAngle: toPlayer,
    };
  }

  damage(amount: number) {
    this.hp -= amount;
    this.showDamageNumber(amount);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(45, () => {
      if (this.active) {
        this.clearTint();
        if (!this.spriteKey) {
          this.setTint(this.enemyData.color);
        }
      }
    });
    return this.hp <= 0;
  }

  private showDamageNumber(amount: number) {
    const roundedDamage = Math.max(1, Math.round(amount));
    const isHeavyHit = amount >= 18 || amount >= this.maxHp * 0.35;
    const startX = this.x + Phaser.Math.Between(-8, 8);
    const startY = this.y - this.enemyData.radius - Phaser.Math.Between(12, 20);
    const driftX = Phaser.Math.Between(-18, 18);
    DamageNumberPool.show(this.scene, {
      value: roundedDamage,
      heavy: isHeavyHit,
      startX,
      startY,
      driftX,
      colorOverride: isHeavyHit ? "#ffd15c" : COLORS.text,
    });
  }

  private makeHitbox(scale: number): CircleHitbox {
    const radius = Math.max(7, this.enemyData.radius * scale);
    return {
      x: this.x,
      y: this.y + this.enemyData.radius * ENEMY_HITBOX_OFFSET_Y,
      radius,
    };
  }
}
