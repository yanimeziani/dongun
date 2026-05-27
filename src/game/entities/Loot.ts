import Phaser from "phaser";
import type { CircleHitbox } from "../systems/HitboxSystem";
import { LOOT_DEPTH } from "../utils/constants";

export type LootKind = "xp" | "gold" | "heal" | "chest";

const LOOT_PICKUP_RADIUS: Record<LootKind, number> = {
  xp: 10,
  gold: 10,
  heal: 12,
  chest: 22,
};

export class Loot extends Phaser.Physics.Arcade.Image {
  kind: LootKind;
  value: number;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: LootKind, value: number) {
    super(scene, x, y, `loot-${kind}`);
    this.kind = kind;
    this.value = value;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(LOOT_DEPTH);
    this.setCircle(kind === "chest" ? 18 : 10);
  }

  getPickupHitbox(): CircleHitbox {
    return {
      x: this.x,
      y: this.y,
      radius: LOOT_PICKUP_RADIUS[this.kind],
    };
  }
}
