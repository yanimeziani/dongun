import Phaser from "phaser";
import { COLORS, UI_DEPTH } from "../utils/constants";

const PEAK_ALPHA = 0.7;
const FADE_DURATION = 540;
const EDGE_ALPHA = 0.34;
const CENTER_ALPHA = 0.08;
const RING_STEPS = 28;

export class BloodVignette {
  private graphics: Phaser.GameObjects.Graphics;
  private fadeTween?: Phaser.Tweens.Tween;
  private currentAlpha = 0;

  constructor(private scene: Phaser.Scene) {
    this.graphics = scene.add
      .graphics()
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 5)
      .setAlpha(0);

    this.redraw();
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.redraw, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.redraw, this);
      this.fadeTween?.stop();
      this.graphics.destroy();
    });
  }

  pulse(intensity = 1) {
    const target = Phaser.Math.Clamp(PEAK_ALPHA * intensity, 0.18, 0.95);
    this.fadeTween?.stop();
    this.currentAlpha = Math.max(this.currentAlpha, target);
    this.graphics.setAlpha(this.currentAlpha);

    this.fadeTween = this.scene.tweens.add({
      targets: this.graphics,
      alpha: 0,
      duration: FADE_DURATION,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        this.currentAlpha = this.graphics.alpha;
      },
      onComplete: () => {
        this.currentAlpha = 0;
      },
    });
  }

  private redraw() {
    const cam = this.scene.cameras.main;
    const w = cam.width;
    const h = cam.height;

    this.graphics.clear();

    this.graphics.fillStyle(COLORS.red, CENTER_ALPHA);
    this.graphics.fillRect(0, 0, w, h);

    const halfW = w / 2;
    const halfH = h / 2;
    const ringDelta = (EDGE_ALPHA - CENTER_ALPHA) / RING_STEPS;

    for (let i = 0; i < RING_STEPS; i += 1) {
      const t = i / RING_STEPS;
      const nextT = (i + 1) / RING_STEPS;
      const x0 = t * halfW;
      const y0 = t * halfH;
      const x1 = nextT * halfW;
      const y1 = nextT * halfH;
      const bandThicknessX = x1 - x0;
      const bandThicknessY = y1 - y0;
      const innerW = w - x0 * 2;
      const innerH = h - y0 * 2;
      const alpha = ringDelta * (RING_STEPS - i);
      this.graphics.fillStyle(COLORS.red, alpha);
      this.graphics.fillRect(x0, y0, innerW, bandThicknessY);
      this.graphics.fillRect(x0, h - y0 - bandThicknessY, innerW, bandThicknessY);
      this.graphics.fillRect(x0, y0 + bandThicknessY, bandThicknessX, innerH - bandThicknessY * 2);
      this.graphics.fillRect(w - x0 - bandThicknessX, y0 + bandThicknessY, bandThicknessX, innerH - bandThicknessY * 2);
    }
  }
}
