import Phaser from "phaser";
import { Enemy } from "../entities/Enemy";
import { Loot, type LootKind } from "../entities/Loot";
import { Player } from "../entities/Player";

export class LootSystem {
  constructor(
    private scene: Phaser.Scene,
    private group: Phaser.Physics.Arcade.Group,
  ) {}

  dropFromEnemy(enemy: Enemy, goldGain: number) {
    this.spawn(enemy.x, enemy.y, "xp", enemy.enemyData.xpDrop);

    if (Math.random() < enemy.enemyData.goldChance) {
      this.spawn(
        enemy.x + Phaser.Math.Between(-18, 18),
        enemy.y + Phaser.Math.Between(-18, 18),
        "gold",
        Math.max(1, Math.round(enemy.enemyData.goldValue * goldGain)),
      );
    }

    if (Math.random() < 0.012 || enemy.kind === "brute" && Math.random() < 0.02) {
      this.spawn(enemy.x + Phaser.Math.Between(-28, 28), enemy.y + Phaser.Math.Between(-28, 28), "chest", 1);
    }

    if (Math.random() < 0.018) {
      this.spawn(enemy.x, enemy.y, "heal", 12);
    }
  }

  spawn(x: number, y: number, kind: LootKind, value: number) {
    const loot = new Loot(this.scene, x, y, kind, value);
    this.group.add(loot);
    return loot;
  }

  update(player: Player, deltaSeconds: number) {
    for (const child of this.group.getChildren()) {
      const loot = child as Loot;
      if (!loot.active) {
        continue;
      }

      const body = loot.body as Phaser.Physics.Arcade.Body;
      const distance = Phaser.Math.Distance.Between(player.x, player.y, loot.x, loot.y);
      const magnetRadius =
        player.stats.pickupRadius *
        (loot.kind === "xp" ? 7.5 : loot.kind === "gold" ? 7.5 : loot.kind === "chest" ? 2.4 : 2.2);

      if (distance < magnetRadius) {
        const speed = Phaser.Math.Linear(130, 520, 1 - distance / magnetRadius);
        const angle = Phaser.Math.Angle.Between(loot.x, loot.y, player.x, player.y);
        loot.setPosition(loot.x + Math.cos(angle) * speed * deltaSeconds, loot.y + Math.sin(angle) * speed * deltaSeconds);
      } else {
        body.setVelocity(0, 0);
      }
    }
  }
}
