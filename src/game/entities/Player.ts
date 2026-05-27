import Phaser from "phaser";
import { STARTING_WEAPON_ID } from "../data/weapons";
import type { CircleHitbox } from "../systems/HitboxSystem";
import type { PlayerStats, RunModifiers, WeaponId } from "../types";
import { COLORS, PLAYER_DEPTH } from "../utils/constants";

const PLAYER_HURTBOX_RADIUS = 22;
const PLAYER_HURTBOX_OFFSET_Y = 8;
const PLAYER_PICKUP_HITBOX_RADIUS = 34;
const PLAYER_SPRITE_SCALE = 0.34;
const DIRECTIONAL_WALK_RATE = 12;
const DIRECTIONAL_WALK_TILT_DEGREES = 1.8;
const DIRECTIONAL_WALK_SCALE_PULSE = 0.018;
const XP_BASE_REQUIREMENT = 14;
const XP_LINEAR_REQUIREMENT = 6;
const XP_LEVEL_GROWTH = 1.22;

// Slot order = clockwise from East: E, SE, S, SW, W, NW, N, NE.
// The generated 8dir sheet is already exported in that order:
// top row = E, SE, S, SW; bottom row = W, NW, N, NE.
const DIR_FRAMES_8: ReadonlyArray<number> = [0, 1, 2, 3, 4, 5, 6, 7];

function xpRequiredForLevel(level: number) {
  const step = Math.max(1, Math.floor(level));
  return Math.round((XP_BASE_REQUIREMENT + XP_LINEAR_REQUIREMENT * step) * Math.pow(XP_LEVEL_GROWTH, step - 1));
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats;
  hp: number;
  level = 1;
  xp = 0;
  nextXp = xpRequiredForLevel(1);
  runGold = 0;
  kills = 0;
  ownedWeapons = new Set<WeaponId>([STARTING_WEAPON_ID]);
  weaponLevels: Record<string, number> = { [STARTING_WEAPON_ID]: 1 };
  modifiers: RunModifiers;
  lastAimAngle = 0;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<string, Phaser.Input.Keyboard.Key>;
  private readonly animated: boolean;
  private readonly directional: boolean;
  private isMoving = false;
  private facingLeft = false;
  private currentDirFrame = -1;
  private directionalWalkTime = 0;
  private directionalWalkPulse = 0;
  private shadow?: Phaser.GameObjects.Ellipse;
  private rim?: Phaser.GameObjects.Arc;
  private fxOffsetY = 26;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    stats: PlayerStats,
    modifiers: RunModifiers,
  ) {
    const has8Dir = scene.textures.exists("dongun-8dir");
    const hasSheet = scene.textures.exists("dongun-sheet");
    const textureKey = has8Dir ? "dongun-8dir" : hasSheet ? "dongun-sheet" : "player";
    const initialFrame = has8Dir ? DIR_FRAMES_8[0] : hasSheet ? 7 : undefined;
    super(scene, x, y, textureKey, initialFrame);
    this.directional = has8Dir;
    this.animated = has8Dir || hasSheet;
    this.stats = { ...stats };
    this.modifiers = { ...modifiers };
    this.hp = this.stats.maxHp;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys("W,A,S,D") as Record<string, Phaser.Input.Keyboard.Key>;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(PLAYER_DEPTH);
    if (this.directional) {
      this.setScale(PLAYER_SPRITE_SCALE);
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCircle(46, this.width / 2 - 46, this.height / 2 - 46);
      this.applyDirectionalFrame(this.lastAimAngle);
    } else if (this.animated) {
      this.setScale(PLAYER_SPRITE_SCALE);
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setCircle(46, this.width / 2 - 46, this.height / 2 - 46);
      this.play("dongun-idle");
    } else {
      this.setDisplaySize(72, 72);
      this.setCircle(20, this.width / 2 - 20, this.height / 2 - 20);
    }
    this.setCollideWorldBounds(false);
    this.setDamping(true);
    this.setDrag(0.86);
    this.setMaxVelocity(this.stats.moveSpeed);

    this.fxOffsetY = this.animated ? 30 : 26;
    this.shadow = scene.add
      .ellipse(x, y + this.fxOffsetY, 64, 22, 0x000000, 0.6)
      .setDepth(PLAYER_DEPTH - 2);
    this.rim = scene.add
      .circle(x, y, 40, COLORS.cyan, 0.28)
      .setDepth(PLAYER_DEPTH - 1);
  }

  syncFx() {
    if (this.shadow) {
      this.shadow.setPosition(this.x, this.y + this.fxOffsetY);
      this.shadow.setScale(1 + this.directionalWalkPulse * 0.06, 1 - this.directionalWalkPulse * 0.035);
    }
    if (this.rim) {
      this.rim.setPosition(this.x, this.y);
    }
  }

  getHurtbox(): CircleHitbox {
    return {
      x: this.x,
      y: this.y + PLAYER_HURTBOX_OFFSET_Y,
      radius: PLAYER_HURTBOX_RADIUS,
    };
  }

  getPickupHitbox(): CircleHitbox {
    return {
      x: this.x,
      y: this.y + PLAYER_HURTBOX_OFFSET_Y,
      radius: PLAYER_PICKUP_HITBOX_RADIUS,
    };
  }

  updateMovement(deltaSeconds: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const x =
      Number(this.cursors.right?.isDown || this.wasd.D.isDown) -
      Number(this.cursors.left?.isDown || this.wasd.A.isDown);
    const y =
      Number(this.cursors.down?.isDown || this.wasd.S.isDown) -
      Number(this.cursors.up?.isDown || this.wasd.W.isDown);

    let vx = x;
    let vy = y;
    if (vx !== 0 || vy !== 0) {
      const inv = 1 / Math.sqrt(vx * vx + vy * vy);
      vx *= inv;
      vy *= inv;
    }

    this.setPosition(this.x + vx * this.stats.moveSpeed * deltaSeconds, this.y + vy * this.stats.moveSpeed * deltaSeconds);
    body.setVelocity(0, 0);

    const moving = vx !== 0 || vy !== 0;
    if (this.directional) {
      this.isMoving = moving;
      this.applyDirectionalFrame(this.lastAimAngle);
      this.updateDirectionalWalkAnimation(moving, deltaSeconds);
    } else if (this.animated) {
      if (moving !== this.isMoving) {
        this.isMoving = moving;
        this.play(moving ? "dongun-walk" : "dongun-idle", true);
      }
      this.updateFacing(Math.cos(this.lastAimAngle));
    } else if (moving) {
      this.setRotation(this.lastAimAngle + Math.PI / 2);
    }
  }

  aimAt(x: number, y: number) {
    const dx = x - this.x;
    const dy = y - this.y;
    if (dx * dx + dy * dy < 16) {
      return;
    }

    this.lastAimAngle = Math.atan2(dy, dx);
    if (this.directional) {
      this.applyDirectionalFrame(this.lastAimAngle);
    } else if (this.animated) {
      this.updateFacing(dx);
    } else {
      this.setRotation(this.lastAimAngle + Math.PI / 2);
    }
  }

  private updateFacing(directionX: number) {
    if (Math.abs(directionX) < 0.05) {
      return;
    }
    const shouldFaceLeft = directionX < 0;
    if (shouldFaceLeft !== this.facingLeft) {
      this.facingLeft = shouldFaceLeft;
      this.setFlipX(shouldFaceLeft);
    }
  }

  private updateDirectionalWalkAnimation(moving: boolean, deltaSeconds: number) {
    if (!moving) {
      this.directionalWalkTime = 0;
      this.directionalWalkPulse = 0;
      this.setScale(PLAYER_SPRITE_SCALE);
      this.setAngle(0);
      return;
    }

    this.directionalWalkTime += deltaSeconds * DIRECTIONAL_WALK_RATE;
    this.directionalWalkPulse = Math.abs(Math.sin(this.directionalWalkTime));
    const sideSway = Math.sin(this.directionalWalkTime * 0.5);
    this.setScale(
      PLAYER_SPRITE_SCALE * (1 + this.directionalWalkPulse * DIRECTIONAL_WALK_SCALE_PULSE),
      PLAYER_SPRITE_SCALE * (1 - this.directionalWalkPulse * DIRECTIONAL_WALK_SCALE_PULSE),
    );
    this.setAngle(sideSway * DIRECTIONAL_WALK_TILT_DEGREES);
  }

  private applyDirectionalFrame(angleRad: number) {
    const twoPi = Math.PI * 2;
    const normalized = ((angleRad % twoPi) + twoPi) % twoPi;
    const slot = Math.round(normalized / (twoPi / 8)) % 8;
    const frame = DIR_FRAMES_8[slot];
    if (frame !== this.currentDirFrame) {
      this.currentDirFrame = frame;
      this.setFrame(frame);
    }
    if (this.flipX) {
      this.setFlipX(false);
    }
  }

  addXp(amount: number) {
    this.xp += amount;
    let leveled = false;

    while (this.xp >= this.nextXp) {
      this.xp -= this.nextXp;
      this.level += 1;
      this.nextXp = xpRequiredForLevel(this.level);
      leveled = true;
    }

    return leveled;
  }

  takeDamage(rawDamage: number) {
    const damage = Math.max(1, rawDamage - this.stats.armor);
    this.hp = Math.max(0, this.hp - damage);
    return damage;
  }

  heal(amount: number) {
    this.hp = Math.min(this.stats.maxHp, this.hp + amount);
  }
}
