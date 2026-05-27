import type { Enemy } from "../entities/Enemy";

const CELL_SIZE = 64;
const SEPARATION_STRENGTH = 220;
const MAX_PUSH = 320;

type Cell = Enemy[];

export class AISeparationSystem {
  private cells = new Map<number, Cell>();

  resolve(enemies: Iterable<Enemy>) {
    this.cells.clear();

    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }
      enemy.separationVx = 0;
      enemy.separationVy = 0;
      const cellX = Math.floor(enemy.x / CELL_SIZE);
      const cellY = Math.floor(enemy.y / CELL_SIZE);
      const key = cellKey(cellX, cellY);
      let bucket = this.cells.get(key);
      if (!bucket) {
        bucket = [];
        this.cells.set(key, bucket);
      }
      bucket.push(enemy);
    }

    for (const [key, bucket] of this.cells) {
      const { x: cx, y: cy } = decodeKey(key);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const neighborKey = cellKey(cx + dx, cy + dy);
          if (neighborKey < key) {
            continue;
          }
          const neighborBucket = this.cells.get(neighborKey);
          if (!neighborBucket) {
            continue;
          }
          this.pushPairs(bucket, neighborBucket, key === neighborKey);
        }
      }
    }

    for (const bucket of this.cells.values()) {
      for (const enemy of bucket) {
        const mag = Math.hypot(enemy.separationVx, enemy.separationVy);
        if (mag > MAX_PUSH) {
          const scale = MAX_PUSH / mag;
          enemy.separationVx *= scale;
          enemy.separationVy *= scale;
        }
      }
    }
  }

  private pushPairs(a: Cell, b: Cell, sameCell: boolean) {
    for (let i = 0; i < a.length; i += 1) {
      const ea = a[i];
      const startJ = sameCell ? i + 1 : 0;
      for (let j = startJ; j < b.length; j += 1) {
        const eb = b[j];
        const dx = eb.x - ea.x;
        const dy = eb.y - ea.y;
        const minDist = ea.enemyData.radius + eb.enemyData.radius;
        const distSq = dx * dx + dy * dy;
        if (distSq >= minDist * minDist || distSq < 0.01) {
          continue;
        }
        const dist = Math.sqrt(distSq);
        const overlap = (minDist - dist) / minDist;
        const force = overlap * SEPARATION_STRENGTH;
        const nx = dx / dist;
        const ny = dy / dist;
        ea.separationVx -= nx * force;
        ea.separationVy -= ny * force;
        eb.separationVx += nx * force;
        eb.separationVy += ny * force;
      }
    }
  }
}

function cellKey(x: number, y: number) {
  return ((x + 32768) << 16) | ((y + 32768) & 0xffff);
}

function decodeKey(key: number) {
  const x = (key >>> 16) - 32768;
  const y = (key & 0xffff) - 32768;
  return { x, y };
}
