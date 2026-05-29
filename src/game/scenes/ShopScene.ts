import Phaser from "phaser";
import { PERMANENT_UPGRADES, getUpgradeCost } from "../data/permanentUpgrades";
import { SaveSystem } from "../systems/SaveSystem";
import { COLORS } from "../utils/constants";
import { formatGold, secondsToClock } from "../utils/math";
import { getVisibleGameArea } from "../utils/safeArea";

export class ShopScene extends Phaser.Scene {
  constructor() {
    super("ShopScene");
  }

  create() {
    this.render();
  }

  private render() {
    this.children.removeAll();
    const save = SaveSystem.load();
    const safe = getVisibleGameArea(this);
    const compact = safe.width < 560;
    const x = safe.left + (compact ? 18 : 72);
    const rowW = Math.min(compact ? safe.width - 36 : 940, 940);

    this.cameras.main.setBackgroundColor("#0d1018");
    this.add.text(x, safe.top + (compact ? 26 : 48), "Permanent Upgrades", {
      fontFamily: "Inter, Arial",
      fontSize: compact ? "28px" : "42px",
      color: COLORS.text,
      fontStyle: "800",
    });
    this.add.text(x + 4, safe.top + (compact ? 68 : 104), `Gold ${formatGold(save.totalGold)}    Best ${secondsToClock(save.bestSurvivalTime)}`, {
      fontFamily: "Inter, Arial",
      fontSize: compact ? "15px" : "20px",
      color: COLORS.muted,
    });

    PERMANENT_UPGRADES.forEach((upgrade, index) => {
      const y = safe.top + (compact ? 114 : 164) + index * (compact ? 74 : 66);
      const level = save.upgrades[upgrade.id] ?? 0;
      const maxed = level >= upgrade.maxLevel;
      const cost = getUpgradeCost(upgrade, level);
      const canBuy = !maxed && save.totalGold >= cost;

      const row = this.add
        .rectangle(x, y, rowW, compact ? 64 : 52, canBuy ? COLORS.panelBright : COLORS.panel, 1)
        .setOrigin(0)
        .setStrokeStyle(1, canBuy ? COLORS.gold : 0x2d3548, 0.85)
        .setInteractive({ useHandCursor: canBuy });

      this.add.text(x + (compact ? 16 : 22), y + (compact ? 8 : 9), upgrade.name, {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "15px" : "19px",
        color: COLORS.text,
      });
      this.add.text(x + (compact ? 16 : 220), y + (compact ? 30 : 10), upgrade.description, {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "12px" : "16px",
        color: COLORS.muted,
        wordWrap: { width: compact ? rowW - 92 : 350 },
      });
      this.add.text(x + rowW - (compact ? 76 : 280), y + (compact ? 8 : 10), `Lv ${level}/${upgrade.maxLevel}`, {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "13px" : "17px",
        color: COLORS.text,
      });
      this.add.text(x + rowW - (compact ? 76 : 150), y + (compact ? 30 : 10), maxed ? "Maxed" : `${cost}g`, {
        fontFamily: "Inter, Arial",
        fontSize: compact ? "13px" : "17px",
        color: canBuy ? "#ffd15c" : COLORS.muted,
      });

      if (canBuy) {
        row.on("pointerdown", () => {
          SaveSystem.purchase(upgrade.id);
          this.render();
        });
      }
    });

    this.button(x, Math.min(safe.bottom - 58, safe.top + 650), compact, "Back", () => this.scene.start("MainMenuScene"));
  }

  private button(x: number, y: number, compact: boolean, label: string, onClick: () => void) {
    const rect = this.add
      .rectangle(x, y, compact ? 146 : 180, 46, COLORS.panelBright, 1)
      .setOrigin(0)
      .setStrokeStyle(1, COLORS.cyan, 0.75)
      .setInteractive({ useHandCursor: true });
    this.add.text(x + (compact ? 28 : 32), y + 11, label, {
      fontFamily: "Inter, Arial",
      fontSize: compact ? "18px" : "20px",
      color: COLORS.text,
    });
    rect.on("pointerdown", onClick);
  }
}
