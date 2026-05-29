import Phaser from "phaser";
import type { UpgradeOption } from "../types";
import { COLORS } from "../utils/constants";
import { getVisibleGameArea } from "../utils/safeArea";

export class UpgradeScene extends Phaser.Scene {
  private choices: UpgradeOption[] = [];

  constructor() {
    super("UpgradeScene");
  }

  init(data: { choices: UpgradeOption[] }) {
    this.choices = data.choices;
  }

  create() {
    const safe = getVisibleGameArea(this);
    const compact = safe.width < 560;
    const cx = safe.left + safe.width / 2;
    this.add.rectangle(0, 0, 1280, 720, 0x06070b, 0.72).setOrigin(0);
    this.add
      .text(cx, safe.top + (compact ? 34 : 84), "Choose an Upgrade", {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "28px" : "42px",
        color: COLORS.text,
        fontStyle: "800",
      })
      .setOrigin(0.5, 0);

    const cardWidth = compact ? Math.min(300, safe.width - 40) : this.choices.length === 4 ? 256 : 300;
    const gap = compact ? 16 : 24;
    const totalWidth = compact ? cardWidth : this.choices.length * cardWidth + (this.choices.length - 1) * gap;
    const startX = cx - totalWidth / 2;
    const startY = safe.top + (compact ? 92 : 206);

    this.choices.forEach((choice, index) => {
      const x = compact ? startX : startX + index * (cardWidth + gap);
      const y = compact ? startY + index * 138 : startY;
      this.card(x, y, cardWidth, compact, choice);
    });

    this.input.keyboard?.once("keydown-ENTER", () => {
      this.pick(this.choices[0]);
    });
  }

  private card(x: number, y: number, width: number, compact: boolean, choice: UpgradeOption) {
    const rarityColor =
      choice.rarity === "legendary" ? COLORS.gold : choice.rarity === "rare" ? COLORS.violet : COLORS.cyan;
    const rect = this.add
      .rectangle(x, y, width, compact ? 122 : 270, COLORS.panel, 0.98)
      .setOrigin(0)
      .setStrokeStyle(2, rarityColor, 0.9)
      .setInteractive({ useHandCursor: true });

    this.add.text(x + 24, y + 22, choice.name, {
      fontFamily: "Inter, Arial",
      fontSize: compact ? "17px" : "22px",
      color: COLORS.text,
      wordWrap: { width: width - 48 },
    });
    this.add.text(x + 24, compact ? y + 52 : y + 92, choice.description, {
      fontFamily: "Inter, Arial",
      fontSize: compact ? "13px" : "17px",
      color: COLORS.muted,
      wordWrap: { width: width - 48 },
      lineSpacing: compact ? 3 : 8,
    });
    this.add.text(x + 24, compact ? y + 100 : y + 212, choice.rarity.toUpperCase(), {
      fontFamily: "Inter, Arial",
      fontSize: compact ? "11px" : "14px",
      color: Phaser.Display.Color.IntegerToColor(rarityColor).rgba,
    });

    rect.on("pointerover", () => rect.setFillStyle(COLORS.panelBright));
    rect.on("pointerout", () => rect.setFillStyle(COLORS.panel));
    rect.on("pointerdown", () => this.pick(choice));
  }

  private pick(choice: UpgradeOption) {
    const gameScene = this.scene.get("GameScene");
    gameScene.events.emit("upgrade-picked", choice);
    this.scene.stop();
    this.scene.resume("GameScene");
  }
}
