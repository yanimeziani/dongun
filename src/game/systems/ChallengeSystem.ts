import Phaser from "phaser";
import { Player } from "../entities/Player";
import { hitboxesOverlap, type CircleHitbox } from "./HitboxSystem";
import { COLORS, UI_DEPTH } from "../utils/constants";

const SHRINE_CAPTURE_RADIUS = 118;

export class ChallengeSystem {
  private marker?: Phaser.GameObjects.Arc;
  private shrine?: Phaser.GameObjects.Image;
  private label?: Phaser.GameObjects.Text;
  private spawnedAtSeconds = 0;
  private progress = 0;
  private nextAt = 70;

  constructor(
    private scene: Phaser.Scene,
    private reward: () => void,
  ) {}

  update(deltaSeconds: number, elapsedSeconds: number, player: Player) {
    if (!this.marker && elapsedSeconds >= this.nextAt) {
      this.spawn(player, elapsedSeconds);
    }

    if (!this.marker) {
      return;
    }

    if (hitboxesOverlap(player.getHurtbox(), this.getMarkerHitbox())) {
      this.progress += deltaSeconds;
      this.marker.setStrokeStyle(5, COLORS.gold, 0.95);
    } else {
      this.progress = Math.max(0, this.progress - deltaSeconds * 0.35);
      this.marker.setStrokeStyle(3, COLORS.gold, 0.45);
    }

    this.label?.setText(`Gold Shrine ${Math.ceil(Math.max(0, 12 - this.progress))}s`);
    this.label?.setPosition(this.marker.x - 82, this.marker.y - 98);

    if (this.progress >= 12) {
      this.reward();
      this.clear(elapsedSeconds);
    }

    if (elapsedSeconds - this.spawnedAtSeconds > 52) {
      this.clear(elapsedSeconds);
    }
  }

  getActiveHitbox(): CircleHitbox | null {
    return this.marker ? this.getMarkerHitbox() : null;
  }

  private spawn(player: Player, elapsedSeconds: number) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Phaser.Math.Between(660, 920);
    const x = player.x + Math.cos(angle) * distance;
    const y = player.y + Math.sin(angle) * distance;

    this.marker = this.scene.add.circle(x, y, SHRINE_CAPTURE_RADIUS, COLORS.gold, 0.08);
    this.marker.setStrokeStyle(3, COLORS.gold, 0.45);
    this.marker.setDepth(UI_DEPTH - 4);
    this.shrine = this.scene.add.image(x, y - 20, "gold-shrine").setDepth(UI_DEPTH - 3).setDisplaySize(88, 88);
    this.scene.tweens.add({
      targets: this.shrine,
      y: y - 26,
      duration: 900,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
    this.label = this.scene.add
      .text(x - 82, y - 98, "Gold Shrine 12s", {
        fontFamily: "Inter, Arial",
        fontSize: "16px",
        color: "#ffd15c",
        stroke: "#090b10",
        strokeThickness: 4,
      })
      .setDepth(UI_DEPTH - 2);
    this.spawnedAtSeconds = elapsedSeconds;
    this.progress = 0;
  }

  private clear(elapsedSeconds: number) {
    this.marker?.destroy();
    if (this.shrine) {
      this.scene.tweens.killTweensOf(this.shrine);
      this.shrine.destroy();
    }
    this.label?.destroy();
    this.marker = undefined;
    this.shrine = undefined;
    this.label = undefined;
    this.progress = 0;
    this.nextAt = elapsedSeconds + 85;
  }

  private getMarkerHitbox(): CircleHitbox {
    return {
      x: this.marker?.x ?? 0,
      y: this.marker?.y ?? 0,
      radius: SHRINE_CAPTURE_RADIUS,
    };
  }
}
