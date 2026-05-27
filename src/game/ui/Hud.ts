import Phaser from "phaser";
import { Player } from "../entities/Player";
import { WEAPONS } from "../data/weapons";
import { UI_DEPTH, UI_THEME } from "../utils/constants";
import { secondsToClock } from "../utils/math";

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

  constructor(private scene: Phaser.Scene) {
    const safe = this.getSafeArea();
    const panelX = safe.left + 18;
    const panelY = safe.top + 18;
    const panelW = 384;
    const panelH = 120;
    const barW = 252;
    const barLeftX = panelX + 110;

    this.panel = scene.add
      .rectangle(panelX, panelY, panelW, panelH, UI_THEME.panelNum, 0.72)
      .setOrigin(0)
      .setScrollFactor(0)
      .setStrokeStyle(1, UI_THEME.panelBorderNum, 1)
      .setDepth(UI_DEPTH);

    this.hpLabel = scene.add
      .text(panelX + 20, panelY + 26, "HP", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: "11px",
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
        fontSize: "11px",
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
        fontSize: "12px",
        color: UI_THEME.textHex,
        fontStyle: "500",
      })
      .setScrollFactor(0)
      .setLetterSpacing(2);

    this.weaponText = scene.add
      .text(panelX + 20, panelY + 98, "", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: "11px",
        color: UI_THEME.mutedHex,
      })
      .setScrollFactor(0)
      .setLetterSpacing(2);

    const timerCenterX = safe.left + safe.width / 2;
    this.timerLabel = scene.add
      .text(timerCenterX, safe.top + 20, "SURVIVAL", {
        fontFamily: UI_THEME.bodyFont,
        fontSize: "11px",
        color: UI_THEME.mutedHex,
        fontStyle: "600",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setLetterSpacing(6);

    this.timerText = scene.add
      .text(timerCenterX, safe.top + 36, "0:00", {
        fontFamily: UI_THEME.titleFont,
        fontSize: "44px",
        color: UI_THEME.accentHex,
        fontStyle: "700",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setLetterSpacing(4)
      .setShadow(0, 3, "#000000", 8, true, true);

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
    ]) {
      element.setDepth(UI_DEPTH + 1);
    }
  }

  update(player: Player, elapsedSeconds: number, enemyCount: number) {
    const innerW = (this.hpBar.width as number) - 2;
    this.hpFill.width = Math.max(0, innerW * Phaser.Math.Clamp(player.hp / player.stats.maxHp, 0, 1));
    const xpInnerW = (this.xpBar.width as number) - 2;
    this.xpFill.width = Math.max(0, xpInnerW * Phaser.Math.Clamp(player.xp / player.nextXp, 0, 1));
    this.statsText.setText(
      `LV ${player.level}   •   GOLD ${player.runGold}   •   KILLS ${player.kills}   •   MOBS ${enemyCount}`,
    );
    this.timerText.setText(secondsToClock(elapsedSeconds));
    this.weaponText.setText(
      [...player.ownedWeapons].map((weaponId) => WEAPONS[weaponId].name.toUpperCase()).join("  ·  "),
    );
  }

  private getSafeArea() {
    const designW = this.scene.cameras.main.width;
    const designH = this.scene.cameras.main.height;
    const displayW = this.scene.scale.displaySize.width;
    const displayH = this.scene.scale.displaySize.height;
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
}
