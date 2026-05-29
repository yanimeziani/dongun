import Phaser from "phaser";
import { SaveSystem } from "../systems/SaveSystem";
import { UI_THEME } from "../utils/constants";
import { formatGold, secondsToClock } from "../utils/math";
import { playMusic } from "../utils/music";
import { getVisibleGameArea } from "../utils/safeArea";
import { Settings } from "../utils/settings";

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

    const safe = getVisibleGameArea(this);
    const compact = safe.width < 560;
    const colX = safe.left + (compact ? 20 : 32);
    const titleY = Math.round(safe.top + safe.height * (compact ? 0.16 : 0.15));
    const buttonWidth = Math.min(compact ? safe.width - 40 : 320, 320);

    this.add
      .text(colX, titleY, "DONGUN", {
        fontFamily: "Cinzel, 'Cormorant Garamond', Georgia, serif",
        fontSize: compact ? "52px" : "112px",
        color: TITLE_COLOR,
        fontStyle: "700",
        stroke: TITLE_SHADOW,
        strokeThickness: compact ? 4 : 6,
      })
      .setOrigin(0, 0.5)
      .setShadow(2, 6, "#000000", 14, true, true)
      .setLetterSpacing(compact ? 2 : 8);

    this.add
      .text(colX + 4, titleY + (compact ? 40 : 58), "VIBE  SURVIVORS", {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "11px" : "14px",
        color: "#c6b88a",
        fontStyle: "500",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(compact ? 6 : 10);

    const statsText = compact
      ? `BEST ${secondsToClock(save.bestSurvivalTime)}  •  RUNS ${save.totalRuns}\nGOLD ${formatGold(save.totalGold)}`
      : `BEST  ${secondsToClock(save.bestSurvivalTime)}    •    RUNS  ${save.totalRuns}    •    GOLD  ${formatGold(save.totalGold)}`;
    this.add
      .text(colX + 4, titleY + (compact ? 84 : 110), statsText, {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "12px" : "13px",
        color: "#a89770",
        fontStyle: "500",
        stroke: "#000000",
        strokeThickness: 3,
        lineSpacing: compact ? 8 : 0,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(compact ? 2 : 4);

    const buttonsY = Math.round(safe.top + safe.height * 0.5);
    this.button(colX, buttonsY, buttonWidth, "ENTER THE DUNGEON", () => this.scene.start("GameScene"));
    this.button(colX, buttonsY + 80, buttonWidth, "PERMANENT UPGRADES", () => this.scene.start("ShopScene"));

    const isTouch =
      this.sys.game.device.input.touch &&
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
    const controlsHint = isTouch
      ? "drag the left side to move    •    aim is automatic    •    weapons fire on their own"
      : "WASD or arrows to move    •    aim with cursor    •    ESC to pause    •    weapons fire automatically";
    this.add
      .text(colX + 4, compact ? safe.bottom - 70 : safe.bottom - 48, controlsHint, {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "11px" : "12px",
        color: "#8b7d5a",
        stroke: "#000000",
        strokeThickness: 3,
        wordWrap: { width: compact ? safe.width - 40 : 780 },
        lineSpacing: 6,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(compact ? 1 : 2);

    this.addSoundToggle(compact ? colX + 4 : safe.right - 150, compact ? safe.bottom - 28 : safe.bottom - 48);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.video?.stop();
      this.video?.destroy();
      this.video = undefined;
    });
  }

  private addSoundToggle(x: number, cy: number) {
    const label = () => (Settings.isMuted() ? "♪ SOUND: OFF" : "♪ SOUND: ON");
    const text = this.add
      .text(x, cy, label(), {
        fontFamily: "Inter, Arial",
        fontSize: "12px",
        color: "#a89770",
        fontStyle: "600",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(2)
      .setInteractive({ useHandCursor: true });

    text.on("pointerover", () => text.setColor(UI_THEME.accentHex));
    text.on("pointerout", () => text.setColor("#a89770"));
    text.on("pointerdown", () => {
      const muted = !Settings.isMuted();
      Settings.setMuted(muted);
      this.sound.mute = muted;
      text.setText(label());
    });
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

  private button(x: number, cy: number, width: number, label: string, onClick: () => void) {
    const height = 52;
    const compact = width < 320;

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
        fontSize: compact ? "13px" : "16px",
        color: "#d6c69a",
        fontStyle: "600",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5)
      .setLetterSpacing(compact ? 2 : 4);

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
