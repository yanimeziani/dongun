import Phaser from "phaser";
import { UI_THEME } from "../utils/constants";
import { Settings } from "../utils/settings";
import { stopMusic } from "../utils/music";
import { getVisibleGameArea } from "../utils/safeArea";

export class PauseScene extends Phaser.Scene {
  private muteText?: Phaser.GameObjects.Text;
  private buttonWidth = 300;

  constructor() {
    super("PauseScene");
  }

  create() {
    const safe = getVisibleGameArea(this);
    const cx = safe.left + safe.width / 2;
    const cy = safe.top + safe.height / 2;
    const compact = safe.width < 520;
    const panelW = Math.min(420, safe.width - 36);
    const panelH = compact ? 388 : 420;
    this.buttonWidth = Math.min(300, panelW - 36);

    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x05060a, 0.78).setOrigin(0);

    const panel = this.add
      .rectangle(cx, cy, panelW, panelH, UI_THEME.panelNum, 0.96)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1);
    panel.setOrigin(0.5);

    this.add
      .text(cx, cy - 150, "PAUSED", {
        fontFamily: UI_THEME.titleFont,
        fontSize: compact ? "42px" : "56px",
        color: UI_THEME.accentHex,
        fontStyle: "700",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setLetterSpacing(compact ? 4 : 6);

    this.button(cx, cy - 56, compact, "RESUME", () => this.resumeGame());
    this.button(cx, cy + 8, compact, "RESTART RUN", () => {
      this.scene.stop("GameScene");
      this.scene.start("GameScene");
      this.scene.stop();
    });
    this.button(cx, cy + 72, compact, "ABANDON TO MENU", () => {
      stopMusic(this);
      this.scene.stop("GameScene");
      this.scene.start("MainMenuScene");
      this.scene.stop();
    });
    this.muteText = this.button(cx, cy + 136, compact, this.muteLabel(), () => this.toggleMute());

    this.input.keyboard?.on("keydown-ESC", this.resumeGame, this);
    this.input.keyboard?.on("keydown-P", this.resumeGame, this);
  }

  private resumeGame() {
    this.scene.resume("GameScene");
    this.scene.stop();
  }

  private muteLabel() {
    return Settings.isMuted() ? "SOUND: OFF" : "SOUND: ON";
  }

  private toggleMute() {
    const muted = !Settings.isMuted();
    Settings.setMuted(muted);
    this.sound.mute = muted;
    this.muteText?.setText(this.muteLabel());
  }

  private button(cx: number, cy: number, compact: boolean, label: string, onClick: () => void) {
    const width = this.buttonWidth;
    const height = 50;
    const rect = this.add
      .rectangle(cx, cy, width, height, 0x14110a, 0.6)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(cx, cy, label, {
        fontFamily: UI_THEME.bodyFont,
        fontSize: compact ? "14px" : "17px",
        color: UI_THEME.textHex,
        fontStyle: "600",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setLetterSpacing(compact ? 2 : 4);

    rect.on("pointerover", () => {
      rect.setFillStyle(0x1a140a, 0.9);
      rect.setStrokeStyle(1, UI_THEME.accentNum, 1);
      text.setColor(UI_THEME.accentHex);
    });
    rect.on("pointerout", () => {
      rect.setFillStyle(0x14110a, 0.6);
      rect.setStrokeStyle(1, UI_THEME.panelBorderNum, 1);
      text.setColor(UI_THEME.textHex);
    });
    rect.on("pointerdown", onClick);

    return text;
  }
}
