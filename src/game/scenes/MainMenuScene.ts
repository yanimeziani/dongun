import Phaser from "phaser";
import { SaveSystem } from "../systems/SaveSystem";
import { UI_THEME } from "../utils/constants";
import { formatGold, secondsToClock } from "../utils/math";
import { playMusic } from "../utils/music";

const TITLE_COLOR = UI_THEME.accentHex;
const TITLE_SHADOW = "#1a0c00";
const ACCENT_HEX = UI_THEME.accentHex;
const ACCENT_NUM = UI_THEME.accentNum;
const PANEL_NUM = UI_THEME.panelNum;
const PANEL_BORDER_NUM = UI_THEME.panelBorderNum;

export class MainMenuScene extends Phaser.Scene {
  private video?: Phaser.GameObjects.Video;

  constructor() {
    super("MainMenuScene");
  }

  create() {
    const save = SaveSystem.load();
    const cam = this.cameras.main;
    const w = cam.width;
    const h = cam.height;

    cam.setBackgroundColor("#05060a");

    this.addBackgroundVideo(w, h);
    this.startMenuMusic();

    const safe = this.getSafeArea();
    const colX = safe.left + 32;
    const titleY = Math.round(safe.top + safe.height * 0.15);

    this.add
      .text(colX, titleY, "DONGUN", {
        fontFamily: "Cinzel, 'Cormorant Garamond', Georgia, serif",
        fontSize: "112px",
        color: TITLE_COLOR,
        fontStyle: "700",
        stroke: TITLE_SHADOW,
        strokeThickness: 6,
      })
      .setOrigin(0, 0.5)
      .setShadow(2, 6, "#000000", 14, true, true)
      .setLetterSpacing(8);

    this.add
      .text(colX + 4, titleY + 58, "VIBE  SURVIVORS", {
        fontFamily: "Inter, Arial",
        fontSize: "14px",
        color: "#c6b88a",
        fontStyle: "500",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(10);

    const statsText = `BEST  ${secondsToClock(save.bestSurvivalTime)}    •    RUNS  ${save.totalRuns}    •    GOLD  ${formatGold(save.totalGold)}`;
    this.add
      .text(colX + 4, titleY + 110, statsText, {
        fontFamily: "Inter, Arial",
        fontSize: "13px",
        color: "#a89770",
        fontStyle: "500",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(4);

    const buttonsY = Math.round(safe.top + safe.height * 0.5);
    this.button(colX, buttonsY, "ENTER THE DUNGEON", () => this.scene.start("GameScene"));
    this.button(colX, buttonsY + 80, "PERMANENT UPGRADES", () => this.scene.start("ShopScene"));

    this.add
      .text(colX + 4, safe.bottom - 48, "WASD or arrows to move    •    aim with cursor    •    weapons fire automatically", {
        fontFamily: "Inter, Arial",
        fontSize: "12px",
        color: "#8b7d5a",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(2);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.video?.stop();
      this.video?.destroy();
      this.video = undefined;
    });
  }

  private getSafeArea() {
    const designW = this.cameras.main.width;
    const designH = this.cameras.main.height;
    const displayW = this.scale.displaySize.width;
    const displayH = this.scale.displaySize.height;
    const scale = Math.max(displayW / designW, displayH / designH);
    const visibleW = displayW / scale;
    const visibleH = displayH / scale;
    const left = Math.round((designW - visibleW) / 2);
    const top = Math.round((designH - visibleH) / 2);
    return {
      left,
      top,
      right: designW - left,
      bottom: designH - top,
      width: Math.round(visibleW),
      height: Math.round(visibleH),
    };
  }

  private startMenuMusic() {
    const tryPlay = () => playMusic(this, "music-menu", 0.45);
    tryPlay();
    if (this.sound.locked) {
      this.sound.once(Phaser.Sound.Events.UNLOCKED, tryPlay);
    }
  }

  private addBackgroundVideo(w: number, h: number) {
    if (!this.cache.video.exists("menu-bg-video")) {
      return;
    }
    const video = this.add.video(w / 2, h / 2, "menu-bg-video");
    video.setOrigin(0.5);
    video.setLoop(true);
    video.setMute(true);
    video.play(true);
    video.once(Phaser.GameObjects.Events.VIDEO_PLAY, () => this.fitVideo(video, w, h));
    video.on(Phaser.GameObjects.Events.VIDEO_METADATA, () => this.fitVideo(video, w, h));
    this.fitVideo(video, w, h);
    video.setDepth(-100);
    this.video = video;
  }

  private fitVideo(video: Phaser.GameObjects.Video, w: number, h: number) {
    const vw = video.width || 1920;
    const vh = video.height || 1080;
    if (!vw || !vh) {
      return;
    }
    const scale = Math.max(w / vw, h / vh);
    video.setDisplaySize(vw * scale, vh * scale);
  }

  private button(x: number, cy: number, label: string, onClick: () => void) {
    const width = 320;
    const height = 52;

    const rect = this.add
      .rectangle(x, cy, width, height, PANEL_NUM, 0.55)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, PANEL_BORDER_NUM, 1)
      .setInteractive({ useHandCursor: true });

    const leftMark = this.add
      .text(x + 18, cy, "❖", {
        fontFamily: "Inter, Arial",
        fontSize: "11px",
        color: "#5a4720",
      })
      .setOrigin(0, 0.5);

    const text = this.add
      .text(x + 42, cy, label, {
        fontFamily: "Inter, Arial",
        fontSize: "16px",
        color: "#d6c69a",
        fontStyle: "600",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(4);

    const setHover = (hover: boolean) => {
      rect.setFillStyle(hover ? 0x1a140a : PANEL_NUM, hover ? 0.82 : 0.55);
      rect.setStrokeStyle(1, hover ? ACCENT_NUM : PANEL_BORDER_NUM, 1);
      text.setColor(hover ? ACCENT_HEX : "#d6c69a");
      leftMark.setColor(hover ? ACCENT_HEX : "#5a4720");
    };

    rect.on("pointerover", () => setHover(true));
    rect.on("pointerout", () => setHover(false));
    rect.on("pointerdown", onClick);
  }
}
