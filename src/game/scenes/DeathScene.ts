import Phaser from "phaser";
import type { RunResults } from "../types";
import { UI_THEME } from "../utils/constants";
import { formatGold, secondsToClock } from "../utils/math";
import { stopMusic } from "../utils/music";
import { getVisibleGameArea } from "../utils/safeArea";

type DeathData = RunResults & {
  isNewBest?: boolean;
  bestSurvivalTime?: number;
};

export class DeathScene extends Phaser.Scene {
  private deathData!: DeathData;

  constructor() {
    super("DeathScene");
  }

  init(data: DeathData) {
    this.deathData = data;
  }

  create() {
    stopMusic(this);
    if (this.cache.audio.exists("sfx-don-gun")) {
      this.sound.play("sfx-don-gun", { volume: 0.7 });
    }

    const cam = this.cameras.main;
    const safe = getVisibleGameArea(this);
    const compact = safe.width < 560;
    const cx = safe.left + safe.width / 2;
    cam.setBackgroundColor("#05060a");

    this.add
      .text(cx, safe.top + (compact ? 58 : 86), "RUN OVER", {
        fontFamily: UI_THEME.titleFont,
        fontSize: compact ? "44px" : "76px",
        color: UI_THEME.accentHex,
        fontStyle: "700",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0)
      .setLetterSpacing(compact ? 3 : 6);

    if (this.deathData.isNewBest) {
      const banner = this.add
        .text(cx, safe.top + (compact ? 124 : 184), "★  NEW BEST TIME  ★", {
          fontFamily: UI_THEME.bodyFont,
          fontSize: compact ? "14px" : "20px",
          color: "#91ff5d",
          fontStyle: "700",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5, 0)
        .setLetterSpacing(compact ? 2 : 4);
      this.tweens.add({
        targets: banner,
        alpha: 0.35,
        duration: 620,
        yoyo: true,
        repeat: -1,
      });
    }

    const lines = [
      ["Survived", secondsToClock(this.deathData.survivalSeconds)],
      ["Best", secondsToClock(this.deathData.bestSurvivalTime ?? this.deathData.survivalSeconds)],
      ["Level", `${this.deathData.level}`],
      ["Kills", `${this.deathData.kills}`],
      ["Gold banked", formatGold(this.deathData.goldEarned)],
    ];

    const startY = safe.top + (compact ? 176 : 248);
    lines.forEach(([label, value], i) => {
      const y = startY + i * (compact ? 34 : 40);
      this.add
        .text(cx - (compact ? 112 : 150), y, label, {
          fontFamily: UI_THEME.bodyFont,
          fontSize: compact ? "16px" : "22px",
          color: UI_THEME.mutedHex,
        })
        .setOrigin(0, 0.5);
      this.add
        .text(cx + (compact ? 112 : 150), y, value, {
          fontFamily: UI_THEME.bodyFont,
          fontSize: compact ? "16px" : "22px",
          color: UI_THEME.textHex,
          fontStyle: "700",
        })
        .setOrigin(1, 0.5);
    });

    const buttonY = startY + lines.length * (compact ? 34 : 40) + (compact ? 34 : 48);
    if (compact) {
      this.button(cx, buttonY, compact, "RESTART  (R)", () => this.scene.start("GameScene"));
      this.button(cx, buttonY + 58, compact, "UPGRADE SHOP", () => this.scene.start("ShopScene"));
      this.button(cx, buttonY + 116, compact, "MAIN MENU", () => this.scene.start("MainMenuScene"));
    } else {
      this.button(cx - 230, buttonY, compact, "RESTART  (R)", () => this.scene.start("GameScene"));
      this.button(cx, buttonY, compact, "UPGRADE SHOP", () => this.scene.start("ShopScene"));
      this.button(cx + 230, buttonY, compact, "MAIN MENU", () => this.scene.start("MainMenuScene"));
    }

    this.input.keyboard?.once("keydown-R", () => this.scene.start("GameScene"));
    this.input.keyboard?.once("keydown-ESC", () => this.scene.start("MainMenuScene"));
  }

  private button(cx: number, y: number, compact: boolean, label: string, onClick: () => void) {
    const width = compact ? 238 : 206;
    const height = 52;
    const rect = this.add
      .rectangle(cx, y, width, height, UI_THEME.panelNum, 0.7)
      .setOrigin(0.5)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(cx, y, label, {
        fontFamily: UI_THEME.bodyFont,
        fontSize: compact ? "14px" : "16px",
        color: UI_THEME.textHex,
        fontStyle: "600",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setLetterSpacing(compact ? 1 : 2);

    rect.on("pointerover", () => {
      rect.setFillStyle(0x1a140a, 0.92);
      rect.setStrokeStyle(1, UI_THEME.accentNum, 1);
      text.setColor(UI_THEME.accentHex);
    });
    rect.on("pointerout", () => {
      rect.setFillStyle(UI_THEME.panelNum, 0.7);
      rect.setStrokeStyle(1, UI_THEME.panelBorderNum, 1);
      text.setColor(UI_THEME.textHex);
    });
    rect.on("pointerdown", onClick);
  }
}
