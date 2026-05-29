import Phaser from "phaser";
import { Player } from "../entities/Player";
import { WEAPONS } from "../data/weapons";
import { UI_DEPTH, UI_THEME } from "../utils/constants";
import { secondsToClock } from "../utils/math";
import { getVisibleGameArea } from "../utils/safeArea";

const HP_FILL = 0xc25a4d;
const HP_TRACK = 0x1a0c0a;
const XP_FILL = UI_THEME.accentNum;
const XP_TRACK = 0x1d180a;

export class Hud {
  private panel: Phaser.GameObjects.Rectangle;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpFill: Phaser.GameObjects.Rectangle;
  private xpBar: Phaser.GameObjects.Rectangle;
  private xpFill: Phaser.GameObjects.Rectangle;
  private timerText: Phaser.GameObjects.Text;
  private timerLabel: Phaser.GameObjects.Text;
  private statsText: Phaser.GameObjects.Text;
  private weaponText: Phaser.GameObjects.Text;
  private hpLabel: Phaser.GameObjects.Text;
  private xpLabel: Phaser.GameObjects.Text;
  private bossLabel: Phaser.GameObjects.Text;
  private bossBar: Phaser.GameObjects.Rectangle;
  private bossFill: Phaser.GameObjects.Rectangle;
  private compact = false;

  constructor(private scene: Phaser.Scene) {
    const safe = getVisibleGameArea(scene);
    this.compact = safe.width < 520;
    const panelX = safe.left + 18;
    const panelY = safe.top + 18;
    const panelW = this.compact ? Math.max(220, Math.min(300, safe.width - 96)) : 384;
    const panelH = 120;
    const barLeftX = panelX + (this.compact ? 52 : 110);
    const barW = this.compact ? Math.max(88, panelW - 142) : 252;

    this.panel = scene.add
      .rectangle(panelX, panelY, panelW, panelH, UI_THEME.panelNum, 0.72)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1)
      .setDepth(UI_DEPTH);

    this.hpLabel = scene.add
      .text(panelX + 20, panelY + 26, "HP", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: this.compact ? "10px" : "11px",
        color: UI_THEME.mutedHex,
        fontStyle: "600",
      })
      .setScrollFactor(0)
      .setLetterSpacing(3)
      .setOrigin(0, 0.5);

    this.hpBar = scene.add
      .rectangle(barLeftX, panelY + 26, barW, 12, HP_TRACK, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1);
    this.hpFill = scene.add
      .rectangle(barLeftX + 1, panelY + 26, barW - 2, 10, HP_FILL, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    this.xpLabel = scene.add
      .text(panelX + 20, panelY + 50, "XP", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: this.compact ? "10px" : "11px",
        color: UI_THEME.mutedHex,
        fontStyle: "600",
      })
      .setScrollFactor(0)
      .setLetterSpacing(3)
      .setOrigin(0, 0.5);

    this.xpBar = scene.add
      .rectangle(barLeftX, panelY + 50, barW, 8, XP_TRACK, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1);
    this.xpFill = scene.add
      .rectangle(barLeftX + 1, panelY + 50, 1, 6, XP_FILL, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    this.statsText = scene.add
      .text(panelX + 20, panelY + 76, "", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: this.compact ? "10px" : "12px",
        color: UI_THEME.textHex,
        fontStyle: "500",
      })
      .setScrollFactor(0)
      .setLetterSpacing(2);

    this.weaponText = scene.add
      .text(panelX + 20, panelY + 98, "", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: this.compact ? "10px" : "11px",
        color: UI_THEME.mutedHex,
      })
      .setScrollFactor(0)
      .setLetterSpacing(2);

    const timerCenterX = this.compact ? panelX + panelW - 44 : safe.left + safe.width / 2;
    const timerLabelY = this.compact ? panelY + 16 : safe.top + 20;
    const timerTextY = this.compact ? panelY + 32 : safe.top + 36;
    this.timerLabel = scene.add
      .text(timerCenterX, timerLabelY, "SURVIVAL", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: this.compact ? "9px" : "11px",
        color: UI_THEME.mutedHex,
        fontStyle: "600",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setLetterSpacing(6);

    this.timerText = scene.add
      .text(timerCenterX, timerTextY, "0:00", {
        fontFamily: UI_THEME.titleFont,
        fontSize: this.compact ? "28px" : "44px",
        color: UI_THEME.accentHex,
        fontStyle: "700",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setLetterSpacing(4)
      .setShadow(0, 3, "#000000", 8, true, true);

    const bossBarW = Math.max(180, Math.min(safe.width - (this.compact ? 40 : 96), 560));
    const bossY = safe.top + (this.compact ? 140 : 96);
    this.bossLabel = scene.add
      .text(timerCenterX, bossY - 14, "", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: "12px",
        color: "#ff8a9c",
        fontStyle: "700",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setLetterSpacing(4)
      .setVisible(false);
    this.bossBar = scene.add
      .rectangle(timerCenterX, bossY, bossBarW, 12, 0x1a0c0a, 0.92)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0xff4d6d, 0.9)
      .setVisible(false);
    this.bossFill = scene.add
      .rectangle(timerCenterX - bossBarW / 2 + 1, bossY, bossBarW - 2, 10, 0xff4d6d, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setVisible(false);

    for (const element of [
      this.hpLabel,
      this.hpBar,
      this.hpFill,
      this.xpLabel,
      this.xpBar,
      this.xpFill,
      this.statsText,
      this.weaponText,
      this.timerLabel,
      this.timerText,
      this.bossLabel,
      this.bossBar,
      this.bossFill,
    ]) {
      element.setDepth(UI_DEPTH + 1);
    }
  }

  showBoss(name: string) {
    this.bossLabel.setText(name.toUpperCase());
    this.bossFill.width = this.bossBar.width - 2;
    this.bossLabel.setVisible(true);
    this.bossBar.setVisible(true);
    this.bossFill.setVisible(true);
  }

  updateBoss(fraction: number) {
    const innerW = (this.bossBar.width as number) - 2;
    this.bossFill.width = Math.max(0, innerW * Phaser.Math.Clamp(fraction, 0, 1));
  }

  hideBoss() {
    this.bossLabel.setVisible(false);
    this.bossBar.setVisible(false);
    this.bossFill.setVisible(false);
  }

  update(player: Player, elapsedSeconds: number, enemyCount: number) {
    const innerW = (this.hpBar.width as number) - 2;
    this.hpFill.width = Math.max(0, innerW * Phaser.Math.Clamp(player.hp / player.stats.maxHp, 0, 1));
    const xpInnerW = (this.xpBar.width as number) - 2;
    this.xpFill.width = Math.max(0, xpInnerW * Phaser.Math.Clamp(player.xp / player.nextXp, 0, 1));
    this.statsText.setText(
      this.compact
        ? `LV ${player.level}  GOLD ${player.runGold}  KILLS ${player.kills}`
        : `LV ${player.level}   •   GOLD ${player.runGold}   •   KILLS ${player.kills}   •   MOBS ${enemyCount}`,
    );
    this.timerText.setText(secondsToClock(elapsedSeconds));
    const weapons = [...player.ownedWeapons].map((weaponId) => WEAPONS[weaponId].name.toUpperCase());
    this.weaponText.setText(this.compact ? weapons.slice(0, 2).join("  ") : weapons.join("  ·  "));
  }
}
