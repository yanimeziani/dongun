import Phaser from "phaser";
import { RUNTIME_ASSETS, type RuntimeAssetManifest } from "../data/runtimeAssets";
import { COLORS } from "../utils/constants";
import { Settings } from "../utils/settings";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.json("runtimeAssetManifest", "assets/manifest.json");
    this.load.video("menu-bg-video", "assets/video/ui-bg.mp4", true);
    this.load.spritesheet("dongun-sheet", "assets/sprites/dongun.png?v=normalized-5x4-v1", {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("dongun-8dir", "assets/sprites/dongun_8dir.png?v=4x2-256-v1", {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("dynoblob", "assets/sprites/dynoblob.png?v=normalized-5x4-v1", {
      frameWidth: 256,
      frameHeight: 256,
    });
    this.load.spritesheet("spiderswish", "assets/sprites/spiderswish.png?v=detected-offset-5x4-v3", {
      frameWidth: 320,
      frameHeight: 256,
    });
    this.load.spritesheet("magic9ball", "assets/sprites/magic9ball.png?v=detected-5x4-v1", {
      frameWidth: 320,
      frameHeight: 256,
    });
    this.load.spritesheet("ballzhead", "assets/sprites/ballzhead.png?v=normalized-5x4-v1", {
      frameWidth: 320,
      frameHeight: 320,
    });
    this.load.image("gold-shrine", "assets/sprites/marker_goldshrine_96.png?v=static-cut-v1");
    this.load.audio("music-game", "assets/sound/mushroom-token-rush.mp3");
    this.load.audio("music-menu", "assets/sound/mushroom-token-rush-2.mp3");
    this.load.audio("sfx-don-gun", "assets/sound/don-gun.mp3");
  }

  create() {
    this.sound.mute = Settings.isMuted();
    this.createAnimations();
    this.loadRuntimeAssets();
  }

  private createAnimations() {
    if (this.textures.exists("dongun-sheet") && !this.anims.exists("dongun-walk")) {
      this.anims.create({
        key: "dongun-walk",
        frames: this.anims.generateFrameNumbers("dongun-sheet", { frames: [5, 6, 7, 8, 9] }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: "dongun-idle",
        frames: this.anims.generateFrameNumbers("dongun-sheet", { frames: [7] }),
        frameRate: 1,
        repeat: -1,
      });
    }

    if (this.textures.exists("dynoblob") && !this.anims.exists("dynoblob-walk")) {
      // The prep script exports the source art as a normalized 5x4 sheet,
      // sorted top-to-bottom and left-to-right. Row 2 is the walk cycle.
      this.anims.create({
        key: "dynoblob-walk",
        frames: this.anims.generateFrameNumbers("dynoblob", { frames: [5, 6, 7, 8, 9] }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (this.textures.exists("spiderswish") && !this.anims.exists("spiderswish-walk")) {
      this.anims.create({
        key: "spiderswish-walk",
        frames: this.anims.generateFrameNumbers("spiderswish", { frames: [5, 6, 7, 8, 9] }),
        frameRate: 10,
        repeat: -1,
      });
    }

    if (this.textures.exists("magic9ball") && !this.anims.exists("magic9ball-walk")) {
      this.anims.create({
        key: "magic9ball-walk",
        frames: this.anims.generateFrameNumbers("magic9ball", { frames: [5, 6, 7, 8, 9] }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (this.textures.exists("ballzhead") && !this.anims.exists("ballzhead-walk")) {
      this.anims.create({
        key: "ballzhead-walk",
        frames: this.anims.generateFrameNumbers("ballzhead", { frames: [5, 6, 7, 8, 9] }),
        frameRate: 7,
        repeat: -1,
      });
    }
  }

  private loadRuntimeAssets() {
    const manifest = (this.cache.json.get("runtimeAssetManifest") ?? {}) as RuntimeAssetManifest;
    const loadableAssets = RUNTIME_ASSETS.filter((asset) => manifest[asset.key]);

    if (loadableAssets.length === 0) {
      this.createMissingTextures();
      this.scene.start("MainMenuScene");
      return;
    }

    this.load.once("complete", () => {
      this.createMissingTextures();
      this.scene.start("MainMenuScene");
    });

    for (const asset of loadableAssets) {
      this.load.image(asset.key, manifest[asset.key]);
    }

    this.load.start();
  }

  private createMissingTextures() {
    const graphics = this.add.graphics();

    if (!this.textures.exists("player")) {
      graphics.clear();
      graphics.fillStyle(COLORS.cyan, 1);
      graphics.fillCircle(32, 32, 21);
      graphics.fillStyle(0x101522, 1);
      graphics.fillTriangle(32, 5, 46, 40, 18, 40);
      graphics.fillStyle(COLORS.lime, 1);
      graphics.fillCircle(42, 24, 6);
      graphics.generateTexture("player", 64, 64);
    }

    this.enemyTexture(graphics, "enemy-normal", 24, COLORS.red, 0xff98aa);
    this.enemyTexture(graphics, "enemy-fast", 16, COLORS.orange, 0xffd0ad);
    this.enemyTexture(graphics, "enemy-magic9ball", 25, COLORS.cyan, 0xb7f8ff);
    this.enemyTexture(graphics, "enemy-brute", 38, COLORS.violet, 0xd9c7ff);
    this.enemyTexture(graphics, "enemy-shooter", 23, COLORS.cyan, 0xb7f8ff);
    this.enemyTexture(graphics, "enemy-boss", 60, COLORS.red, 0xffd0ad);

    if (!this.textures.exists("projectile")) {
      graphics.clear();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(12, 12, 9);
      graphics.fillStyle(COLORS.cyan, 0.65);
      graphics.fillCircle(12, 12, 5);
      graphics.generateTexture("projectile", 24, 24);
    }

    if (!this.textures.exists("slice")) {
      graphics.clear();
      graphics.fillStyle(COLORS.lime, 0.95);
      graphics.slice(56, 56, 48, Phaser.Math.DegToRad(215), Phaser.Math.DegToRad(325), false);
      graphics.lineTo(56, 56);
      graphics.closePath();
      graphics.fillPath();
      graphics.generateTexture("slice", 112, 112);
    }

    if (!this.textures.exists("whirlwind")) {
      graphics.clear();
      graphics.lineStyle(5, COLORS.cyan, 0.95);
      graphics.beginPath();
      graphics.arc(24, 24, 18, 0.2, 5.1, false);
      graphics.strokePath();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(39, 13, 4);
      graphics.generateTexture("whirlwind", 48, 48);
    }

    this.lootTexture(graphics, "loot-xp", COLORS.cyan, 11);
    this.lootTexture(graphics, "loot-gold", COLORS.gold, 11);
    this.lootTexture(graphics, "loot-heal", COLORS.lime, 11);

    if (!this.textures.exists("loot-chest")) {
      graphics.clear();
      graphics.fillStyle(COLORS.gold, 1);
      graphics.fillRoundedRect(6, 14, 52, 38, 8);
      graphics.fillStyle(0x73451c, 1);
      graphics.fillRoundedRect(10, 19, 44, 27, 5);
      graphics.lineStyle(3, 0xfff0a3, 1);
      graphics.strokeRoundedRect(6, 14, 52, 38, 8);
      graphics.generateTexture("loot-chest", 64, 64);
    }

    graphics.destroy();
  }

  private enemyTexture(graphics: Phaser.GameObjects.Graphics, key: string, radius: number, color: number, eye: number) {
    if (this.textures.exists(key)) {
      return;
    }

    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(42, 32, radius);
    graphics.fillCircle(22, 38, Math.max(8, radius * 0.42));
    graphics.fillStyle(eye, 1);
    graphics.fillCircle(47, 26, Math.max(4, radius * 0.18));
    graphics.lineStyle(4, color, 1);
    graphics.lineBetween(18, 46, 4, 58);
    graphics.lineBetween(29, 51, 18, 64);
    graphics.lineBetween(52, 47, 66, 58);
    graphics.generateTexture(key, 80, 80);
  }

  private lootTexture(graphics: Phaser.GameObjects.Graphics, key: string, color: number, radius: number) {
    if (this.textures.exists(key)) {
      return;
    }

    graphics.clear();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(16, 16, radius);
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(12, 11, 4);
    graphics.generateTexture(key, 32, 32);
  }
}
