import Phaser from "phaser";
import { ENEMY_TYPES } from "../data/enemies";
import { Enemy } from "../entities/Enemy";
import type { EnemyKind } from "../types";
import { weightedRandom } from "../utils/weightedRandom";

const MIN_SPAWN_DISTANCE = 560;
const OFFSCREEN_SPAWN_MARGIN_MIN = 120;
const OFFSCREEN_SPAWN_MARGIN_MAX = 240;
const OFFSCREEN_SPAWN_SCATTER = 72;

export class EnemySpawnSystem {
  private nextSpawnAt = 0;

  constructor(
    private scene: Phaser.Scene,
    private group: Phaser.Physics.Arcade.Group,
  ) {}

  update(time: number, elapsedSeconds: number, player: Phaser.GameObjects.Components.Transform) {
    const spawnDelay = Math.max(190, 1200 - elapsedSeconds * 6);
    const maxEnemies = Math.min(170, 24 + Math.floor(elapsedSeconds * 1.25));

    if (time < this.nextSpawnAt || this.group.countActive(true) >= maxEnemies) {
      return;
    }

    this.nextSpawnAt = time + spawnDelay;
    const packSize =
      elapsedSeconds > 120
        ? Phaser.Math.Between(2, 5)
        : elapsedSeconds > 45
          ? Phaser.Math.Between(1, 3)
          : Phaser.Math.Between(1, 2);

    for (let i = 0; i < packSize; i += 1) {
      this.spawnEnemy(elapsedSeconds, player);
    }
  }

  private spawnEnemy(elapsedSeconds: number, player: Phaser.GameObjects.Components.Transform) {
    const kinds = (Object.keys(ENEMY_TYPES) as EnemyKind[]).filter(
      (kind) => elapsedSeconds >= ENEMY_TYPES[kind].unlockSeconds,
    );
    const kind = weightedRandom(
      kinds.map((entry) => ({
        item: entry,
        weight:
          entry === "normal"
            ? 1
            : entry === "fast"
              ? Math.min(1.2, elapsedSeconds / 120)
              : entry === "magic9ball"
                ? Math.min(0.75, elapsedSeconds / 150)
                : entry === "brute"
                  ? Math.min(0.75, elapsedSeconds / 180)
                  : Math.min(0.55, elapsedSeconds / 220),
      })),
    );
    const { x, y } = this.getOffscreenSpawnPosition(player);
    const difficulty = 1 + elapsedSeconds / 130;
    const enemy = new Enemy(this.scene, x, y, kind, difficulty);
    this.group.add(enemy);
  }

  private getOffscreenSpawnPosition(player: Phaser.GameObjects.Components.Transform) {
    const angle = Math.random() * Math.PI * 2;
    const edgeDistance = this.distanceToViewportEdge(player.x, player.y, angle);
    const distance = Math.max(edgeDistance, MIN_SPAWN_DISTANCE) + Phaser.Math.Between(
      OFFSCREEN_SPAWN_MARGIN_MIN,
      OFFSCREEN_SPAWN_MARGIN_MAX,
    );
    const scatter = Phaser.Math.Between(-OFFSCREEN_SPAWN_SCATTER, OFFSCREEN_SPAWN_SCATTER);
    const tangentAngle = angle + Math.PI / 2;

    return {
      x: player.x + Math.cos(angle) * distance + Math.cos(tangentAngle) * scatter,
      y: player.y + Math.sin(angle) * distance + Math.sin(tangentAngle) * scatter,
    };
  }

  private distanceToViewportEdge(x: number, y: number, angle: number) {
    const view = this.scene.cameras.main.worldView;
    const left = view.x;
    const right = view.x + view.width;
    const top = view.y;
    const bottom = view.y + view.height;
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

    return Number.isFinite(distance) && distance > 0 ? distance : MIN_SPAWN_DISTANCE;
  }
}
