import Phaser from "phaser";
import type { RunResults } from "../types";
import { COLORS } from "../utils/constants";
import { formatGold, secondsToClock } from "../utils/math";
import { stopMusic } from "../utils/music";

export class DeathScene extends Phaser.Scene {
  private results!: RunResults;

  constructor() {
    super("DeathScene");
  }

  init(data: RunResults) {
    this.results = data;
  }

  create() {
    stopMusic(this);
    if (this.cache.audio.exists("sfx-don-gun")) {
      this.sound.play("sfx-don-gun", { volume: 0.7 });
    }
    this.cameras.main.setBackgroundColor("#090b10");
    this.add
      .text(640, 96, "Run Over", {
        fontFamily: "Inter, Arial",
        fontSize: "68px",
        color: COLORS.text,
        fontStyle: "800",
      })
      .setOrigin(0.5, 0);

    this.add
      .text(
        640,
        210,
        [
          `Survived ${secondsToClock(this.results.survivalSeconds)}`,
          `Level ${this.results.level}`,
          `Kills ${this.results.kills}`,
          `Banked ${formatGold(this.results.goldEarned)} gold`,
        ].join("\n"),
        {
          fontFamily: "Inter, Arial",
          fontSize: "28px",
          color: "#d7e1f4",
          align: "center",
          lineSpacing: 16,
        },
      )
      .setOrigin(0.5, 0);

    this.button(458, 472, "Restart", () => this.scene.start("GameScene"));
    this.button(656, 472, "Upgrade Shop", () => this.scene.start("ShopScene"));

    this.input.keyboard?.once("keydown-R", () => this.scene.start("GameScene"));
  }

  private button(x: number, y: number, label: string, onClick: () => void) {
    const rect = this.add
      .rectangle(x, y, 172, 54, COLORS.panelBright, 1)
      .setOrigin(0)
      .setStrokeStyle(1, COLORS.cyan, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add.text(x + 24, y + 15, label, {
      fontFamily: "Inter, Arial",
      fontSize: "19px",
      color: COLORS.text,
    });
    rect.on("pointerdown", onClick);
  }
}
