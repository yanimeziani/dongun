import Phaser from "phaser";
import type { SweepHitbox } from "../systems/HitboxSystem";
import { PROJECTILE_DEPTH } from "../utils/constants";

export class Projectile extends Phaser.Physics.Arcade.Image {
  damage = 1;
  piercing = false;
  bornAt = 0;
  lifespan = 900;
  wave = false;
  hitRadius = 8;
  previousX = 0;
  previousY = 0;
  baseVelocity = new Phaser.Math.Vector2();
  wavePhase = 0;
  private hitTargets = new WeakSet<object>();

  constructor(scene: Phaser.Scene, x: number, y: number, texture = "projectile") {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(PROJECTILE_DEPTH);
    this.setCircle(8);
  }

  launch(config: {
    x: number;
    y: number;
    angle: number;
    speed: number;
    damage: number;
    piercing: boolean;
    scale: number;
    color: number;
    lifespan: number;
    wave: boolean;
  }) {
    this.enableBody(true, config.x, config.y, true, true);
    this.damage = config.damage;
    this.piercing = config.piercing;
    this.bornAt = this.scene.time.now;
    this.lifespan = config.lifespan;
    this.wave = config.wave;
    this.wavePhase = Math.random() * Math.PI * 2;
    this.hitRadius = Math.max(5, 8 * config.scale);
    this.previousX = config.x;
    this.previousY = config.y;
    this.hitTargets = new WeakSet<object>();
    this.setScale(config.scale);
    this.setTint(config.color);
    this.setRotation(config.angle);
    this.baseVelocity.setTo(Math.cos(config.angle) * config.speed, Math.sin(config.angle) * config.speed);
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(this.baseVelocity.x, this.baseVelocity.y);
  }

  getSweepHitbox(): SweepHitbox {
    return {
      fromX: this.previousX,
      fromY: this.previousY,
      toX: this.x,
      toY: this.y,
      radius: this.hitRadius,
    };
  }

  markHitboxResolved() {
    this.previousX = this.x;
    this.previousY = this.y;
  }

  hasHitTarget(target: object) {
    return this.hitTargets.has(target);
  }

  markTargetHit(target: object) {
    this.hitTargets.add(target);
  }

  update(time: number, _deltaSeconds: number) {
    if (time - this.bornAt > this.lifespan) {
      this.disableBody(true, true);
      return;
    }

    if (!this.wave) {
      return;
    }

    const baseX = this.baseVelocity.x;
    const baseY = this.baseVelocity.y;
    const len = Math.sqrt(baseX * baseX + baseY * baseY) || 1;
    const normalX = -baseY / len;
    const normalY = baseX / len;
    const age = (time - this.bornAt) / 1000;
    const wiggle = Math.sin(age * 14 + this.wavePhase) * 130;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(baseX + normalX * wiggle, baseY + normalY * wiggle);
  }
}
