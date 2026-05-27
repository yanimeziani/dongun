import Phaser from "phaser";

const CHUNK_SIZE = 768;
const STONE_SIZE = 96;
const STONES_PER_CHUNK = CHUNK_SIZE / STONE_SIZE;
const ACTIVE_RADIUS = 2;
const CULL_RADIUS = ACTIVE_RADIUS + 1;
const VARIANT_COUNT = 8;
const TEXTURE_PREFIX = "arena-chunk-";

const GRASS_COLORS = [0x6b7a52, 0x70805a, 0x67764f, 0x758465, 0x6e7d58];
const GRASS_BASE = 0x65755a;
const GRASS_HIGHLIGHT = 0x83906f;
const GRASS_SHADOW = 0x4f5b44;
const FLOWER_COLORS = [0xc7b274, 0xcfa0a8, 0xd6cfb8, 0xa898b8];
const FOLIAGE_DARK = 0x3d4a36;
const FOLIAGE_MID = 0x55624a;
const FOLIAGE_LIGHT = 0x6e7a5f;
const TREE_TRUNK = 0x4a3826;
const TREE_TRUNK_SHADOW = 0x32241a;

type ChunkEntry = {
  image: Phaser.GameObjects.Image;
  chunkX: number;
  chunkY: number;
};

export class ProceduralArenaSystem {
  private chunks = new Map<string, ChunkEntry>();
  private variantReady = false;
  private currentTint = 0xffffff;

  constructor(private scene: Phaser.Scene) {
    this.bakeVariants();
  }

  // Pulse is expected in [0, 1]. Maps to a narrow tint range so terrain stays readable.
  setMusicPulse(low: number, mid: number, high: number) {
    const lowN = Math.max(0, Math.min(1, low));
    const midN = Math.max(0, Math.min(1, mid));
    const highN = Math.max(0, Math.min(1, high));
    // Stay within 0xcc..0xff per channel so tint never darkens the map past readability.
    const r = 0xd6 + Math.round(lowN * 0x29);
    const g = 0xdc + Math.round(midN * 0x23);
    const b = 0xd0 + Math.round(highN * 0x2f);
    const tint = (r << 16) | (g << 8) | b;
    if (tint === this.currentTint) {
      return;
    }
    this.currentTint = tint;
    for (const entry of this.chunks.values()) {
      entry.image.setTint(tint);
    }
  }

  update(focusX: number, focusY: number) {
    if (!this.variantReady) {
      return;
    }

    const centerChunkX = Math.floor(focusX / CHUNK_SIZE);
    const centerChunkY = Math.floor(focusY / CHUNK_SIZE);

    for (let y = centerChunkY - ACTIVE_RADIUS; y <= centerChunkY + ACTIVE_RADIUS; y += 1) {
      for (let x = centerChunkX - ACTIVE_RADIUS; x <= centerChunkX + ACTIVE_RADIUS; x += 1) {
        const key = chunkKey(x, y);
        if (!this.chunks.has(key)) {
          this.chunks.set(key, this.createChunk(x, y));
        }
      }
    }

    for (const entry of this.chunks.values()) {
      if (
        Math.abs(entry.chunkX - centerChunkX) > CULL_RADIUS ||
        Math.abs(entry.chunkY - centerChunkY) > CULL_RADIUS
      ) {
        entry.image.destroy();
        this.chunks.delete(chunkKey(entry.chunkX, entry.chunkY));
      }
    }
  }

  destroy() {
    for (const entry of this.chunks.values()) {
      entry.image.destroy();
    }
    this.chunks.clear();
  }

  private createChunk(chunkX: number, chunkY: number): ChunkEntry {
    const variant = Math.abs(hash2D(chunkX, chunkY, 91)) % VARIANT_COUNT;
    const image = this.scene.add
      .image(chunkX * CHUNK_SIZE, chunkY * CHUNK_SIZE, `${TEXTURE_PREFIX}${variant}`)
      .setOrigin(0, 0)
      .setDepth(-120);
    if (this.currentTint !== 0xffffff) {
      image.setTint(this.currentTint);
    }
    return { image, chunkX, chunkY };
  }

  private bakeVariants() {
    const textures = this.scene.textures;
    for (let v = 0; v < VARIANT_COUNT; v += 1) {
      const key = `${TEXTURE_PREFIX}${v}`;
      if (textures.exists(key)) {
        continue;
      }
      const graphics = this.scene.make.graphics({ x: 0, y: 0 }, false);
      this.drawChunk(graphics, v);
      graphics.generateTexture(key, CHUNK_SIZE, CHUNK_SIZE);
      graphics.destroy();
    }
    this.variantReady = true;
  }

  private drawChunk(graphics: Phaser.GameObjects.Graphics, variant: number) {
    graphics.fillStyle(GRASS_BASE, 1);
    graphics.fillRect(0, 0, CHUNK_SIZE, CHUNK_SIZE);

    for (let tileY = 0; tileY < STONES_PER_CHUNK; tileY += 1) {
      for (let tileX = 0; tileX < STONES_PER_CHUNK; tileX += 1) {
        const rng = seededRandom(tileX, tileY, 19 + variant * 7);
        this.drawGrassTile(graphics, tileX * STONE_SIZE, tileY * STONE_SIZE, rng);
      }
    }

    const rng = seededRandom(variant, variant * 3 + 1, 407);
    this.drawDebris(graphics, rng);
    this.drawAccentCluster(graphics, rng);
  }

  private drawGrassTile(graphics: Phaser.GameObjects.Graphics, x: number, y: number, rng: () => number) {
    const patchColor = GRASS_COLORS[Math.floor(rng() * GRASS_COLORS.length)];
    graphics.fillStyle(patchColor, 0.55);
    const patchRadius = STONE_SIZE * (0.45 + rng() * 0.18);
    graphics.fillCircle(
      x + STONE_SIZE * 0.5 + this.jitter(rng, 18),
      y + STONE_SIZE * 0.5 + this.jitter(rng, 18),
      patchRadius,
    );

    if (rng() < 0.55) {
      graphics.fillStyle(GRASS_HIGHLIGHT, 0.32);
      graphics.fillCircle(x + 18 + rng() * (STONE_SIZE - 36), y + 18 + rng() * (STONE_SIZE - 36), 8 + rng() * 14);
    }

    if (rng() < 0.45) {
      graphics.fillStyle(GRASS_SHADOW, 0.28);
      graphics.fillCircle(x + 14 + rng() * (STONE_SIZE - 28), y + 14 + rng() * (STONE_SIZE - 28), 10 + rng() * 16);
    }

    const bladeCount = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < bladeCount; i += 1) {
      const bx = x + 6 + rng() * (STONE_SIZE - 12);
      const by = y + 12 + rng() * (STONE_SIZE - 18);
      const length = 4 + rng() * 6;
      const lean = (rng() - 0.5) * 4;
      const bladeColor = rng() < 0.5 ? GRASS_HIGHLIGHT : GRASS_SHADOW;
      graphics.lineStyle(1, bladeColor, 0.75);
      graphics.lineBetween(bx, by, bx + lean, by - length);
    }
  }

  private drawDebris(graphics: Phaser.GameObjects.Graphics, rng: () => number) {
    const tuftCount = 30 + Math.floor(rng() * 24);
    for (let i = 0; i < tuftCount; i += 1) {
      const x = rng() * CHUNK_SIZE;
      const y = rng() * CHUNK_SIZE;
      const roll = rng();
      if (roll < 0.04) {
        const color = FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)];
        graphics.fillStyle(color, 0.7);
        graphics.fillCircle(x, y, 1.5 + rng() * 1);
      } else if (roll < 0.22) {
        graphics.fillStyle(0x8a7a5e, 0.45);
        graphics.fillCircle(x, y, 1.5 + rng() * 2);
      } else {
        const length = 3 + rng() * 4;
        const lean = (rng() - 0.5) * 3;
        graphics.lineStyle(1, GRASS_HIGHLIGHT, 0.4);
        graphics.lineBetween(x, y, x + lean, y - length);
      }
    }
  }

  private drawAccentCluster(graphics: Phaser.GameObjects.Graphics, rng: () => number) {
    const clusterCount = 1 + Math.floor(rng() * 2);
    for (let c = 0; c < clusterCount; c += 1) {
      const x = 96 + rng() * (CHUNK_SIZE - 192);
      const y = 96 + rng() * (CHUNK_SIZE - 192);
      const kindRoll = rng();
      if (kindRoll < 0.55) {
        this.drawTree(graphics, x, y, rng);
      } else if (kindRoll < 0.92) {
        this.drawBush(graphics, x, y, rng);
      } else {
        this.drawFlowerPatch(graphics, x, y, rng);
      }
    }
  }

  private drawTree(graphics: Phaser.GameObjects.Graphics, x: number, y: number, rng: () => number) {
    graphics.fillStyle(0x000000, 0.18);
    graphics.fillEllipse(x + 4, y + 28, 70, 22);

    const trunkW = 10 + rng() * 4;
    const trunkH = 26 + rng() * 8;
    graphics.fillStyle(TREE_TRUNK, 1);
    graphics.fillRect(x - trunkW * 0.5, y + 6, trunkW, trunkH);
    graphics.fillStyle(TREE_TRUNK_SHADOW, 0.7);
    graphics.fillRect(x + trunkW * 0.15, y + 6, trunkW * 0.35, trunkH);

    const canopyR = 30 + rng() * 14;
    graphics.fillStyle(FOLIAGE_DARK, 1);
    graphics.fillCircle(x, y, canopyR);
    graphics.fillCircle(x - canopyR * 0.55, y + 4, canopyR * 0.78);
    graphics.fillCircle(x + canopyR * 0.55, y + 4, canopyR * 0.78);
    graphics.fillCircle(x, y - canopyR * 0.55, canopyR * 0.82);

    graphics.fillStyle(FOLIAGE_MID, 0.85);
    graphics.fillCircle(x - canopyR * 0.3, y - canopyR * 0.2, canopyR * 0.6);
    graphics.fillCircle(x + canopyR * 0.35, y - canopyR * 0.1, canopyR * 0.55);

    graphics.fillStyle(FOLIAGE_LIGHT, 0.7);
    graphics.fillCircle(x - canopyR * 0.45, y - canopyR * 0.45, canopyR * 0.28);
    graphics.fillCircle(x + canopyR * 0.15, y - canopyR * 0.55, canopyR * 0.22);
  }

  private drawBush(graphics: Phaser.GameObjects.Graphics, x: number, y: number, rng: () => number) {
    graphics.fillStyle(0x000000, 0.14);
    graphics.fillEllipse(x + 2, y + 14, 48, 14);

    const blobCount = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < blobCount; i += 1) {
      const ox = (rng() - 0.5) * 36;
      const oy = (rng() - 0.5) * 16;
      const r = 12 + rng() * 8;
      graphics.fillStyle(FOLIAGE_DARK, 1);
      graphics.fillCircle(x + ox, y + oy, r);
    }
    for (let i = 0; i < blobCount; i += 1) {
      const ox = (rng() - 0.5) * 30;
      const oy = (rng() - 0.5) * 14 - 4;
      const r = 8 + rng() * 6;
      graphics.fillStyle(FOLIAGE_LIGHT, 0.78);
      graphics.fillCircle(x + ox, y + oy, r);
    }

    if (rng() < 0.5) {
      const berryCount = 2 + Math.floor(rng() * 3);
      for (let i = 0; i < berryCount; i += 1) {
        const color = FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)];
        graphics.fillStyle(color, 0.95);
        graphics.fillCircle(x + (rng() - 0.5) * 30, y + (rng() - 0.5) * 14, 2);
      }
    }
  }

  private drawFlowerPatch(graphics: Phaser.GameObjects.Graphics, x: number, y: number, rng: () => number) {
    graphics.fillStyle(GRASS_HIGHLIGHT, 0.35);
    graphics.fillCircle(x, y, 22 + rng() * 10);

    const flowerCount = 5 + Math.floor(rng() * 5);
    for (let i = 0; i < flowerCount; i += 1) {
      const fx = x + (rng() - 0.5) * 36;
      const fy = y + (rng() - 0.5) * 28;
      const color = FLOWER_COLORS[Math.floor(rng() * FLOWER_COLORS.length)];
      graphics.lineStyle(1, GRASS_SHADOW, 0.7);
      graphics.lineBetween(fx, fy + 4, fx, fy);
      for (let p = 0; p < 4; p += 1) {
        const angle = (p / 4) * Math.PI * 2;
        graphics.fillStyle(color, 0.95);
        graphics.fillCircle(fx + Math.cos(angle) * 2.2, fy + Math.sin(angle) * 2.2, 1.8);
      }
      graphics.fillStyle(0xfff3a0, 1);
      graphics.fillCircle(fx, fy, 1.2);
    }
  }

  private jitter(rng: () => number, amount: number) {
    return (rng() - 0.5) * amount;
  }
}

function chunkKey(chunkX: number, chunkY: number) {
  return `${chunkX}:${chunkY}`;
}

function hash2D(x: number, y: number, salt: number) {
  let seed = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(salt, 2147483647);
  seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
  return (seed ^ (seed >>> 14)) | 0;
}

function seededRandom(x: number, y: number, salt: number) {
  let seed = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(salt, 2147483647);
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
