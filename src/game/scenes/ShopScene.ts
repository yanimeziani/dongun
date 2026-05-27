import Phaser from "phaser";
import { PERMANENT_UPGRADES, getUpgradeCost } from "../data/permanentUpgrades";
import { SaveSystem } from "../systems/SaveSystem";
import { COLORS } from "../utils/constants";
import { formatGold, secondsToClock } from "../utils/math";

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

    this.cameras.main.setBackgroundColor("#0d1018");
    this.add.text(72, 48, "Permanent Upgrades", {
      fontFamily: "Inter, Arial",
      fontSize: "42px",
      color: COLORS.text,
      fontStyle: "800",
    });
    this.add.text(76, 104, `Gold ${formatGold(save.totalGold)}    Best ${secondsToClock(save.bestSurvivalTime)}`, {
      fontFamily: "Inter, Arial",
      fontSize: "20px",
      color: COLORS.muted,
    });

    PERMANENT_UPGRADES.forEach((upgrade, index) => {
      const y = 164 + index * 66;
      const level = save.upgrades[upgrade.id] ?? 0;
      const maxed = level >= upgrade.maxLevel;
      const cost = getUpgradeCost(upgrade, level);
      const canBuy = !maxed && save.totalGold >= cost;

      const row = this.add
        .rectangle(72, y, 940, 52, canBuy ? COLORS.panelBright : COLORS.panel, 1)
        .setOrigin(0)
        .setStrokeStyle(1, canBuy ? COLORS.gold : 0x2d3548, 0.85)
        .setInteractive({ useHandCursor: canBuy });

      this.add.text(94, y + 9, upgrade.name, {
        fontFamily: "Inter, Arial",
        fontSize: "19px",
        color: COLORS.text,
      });
      this.add.text(292, y + 10, upgrade.description, {
        fontFamily: "Inter, Arial",
        fontSize: "16px",
        color: COLORS.muted,
      });
      this.add.text(660, y + 10, `Lv ${level}/${upgrade.maxLevel}`, {
        fontFamily: "Inter, Arial",
        fontSize: "17px",
        color: COLORS.text,
      });
      this.add.text(790, y + 10, maxed ? "Maxed" : `${cost}g`, {
        fontFamily: "Inter, Arial",
        fontSize: "17px",
        color: canBuy ? "#ffd15c" : COLORS.muted,
      });

      if (canBuy) {
        row.on("pointerdown", () => {
          SaveSystem.purchase(upgrade.id);
          this.render();
        });
      }
    });

    this.button(72, 650, "Back", () => this.scene.start("MainMenuScene"));
  }

  private button(x: number, y: number, label: string, onClick: () => void) {
    const rect = this.add
      .rectangle(x, y, 180, 46, COLORS.panelBright, 1)
      .setOrigin(0)
      .setStrokeStyle(1, COLORS.cyan, 0.75)
      .setInteractive({ useHandCursor: true });
    this.add.text(x + 32, y + 11, label, {
      fontFamily: "Inter, Arial",
      fontSize: "20px",
      color: COLORS.text,
    });
    rect.on("pointerdown", onClick);
  }
}
