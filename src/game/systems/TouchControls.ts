import Phaser from "phaser";
import { UI_DEPTH, UI_THEME } from "../utils/constants";

const MAX_RADIUS = 70;
const DEAD_ZONE = 0.18;

/**
 * Floating virtual joystick for touch devices. A pointer that lands on the
 * left portion of the screen spawns the stick under the thumb and drives
 * player movement; aiming is handled automatically (nearest enemy) on touch.
 */
export class TouchControls {
  readonly enabled: boolean;
  private base?: Phaser.GameObjects.Arc;
  private thumb?: Phaser.GameObjects.Arc;
  private ring?: Phaser.GameObjects.Arc;
  private pointerId: number | null = null;
  private originX = 0;
  private originY = 0;
  private moveX = 0;
  private moveY = 0;

  constructor(private scene: Phaser.Scene) {
    const device = scene.sys.game.device.input;
    const coarse =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(pointer: coarse)").matches
        : false;
    this.enabled = device.touch && coarse;

    if (!this.enabled) {
      return;
    }

    // Allow a second finger so movement + UI taps can happen at once.
    scene.input.addPointer(2);
    this.createVisuals();

    scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    scene.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    scene.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  getMoveVector(): { x: number; y: number } {
    return { x: this.moveX, y: this.moveY };
  }

  private createVisuals() {
    this.ring = this.scene.add
      .circle(0, 0, MAX_RADIUS, UI_THEME.accentNum, 0.06)
      .setStrokeStyle(2, UI_THEME.accentNum, 0.35)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 40)
      .setVisible(false);
    this.base = this.scene.add
      .circle(0, 0, 30, 0x000000, 0.3)
      .setStrokeStyle(2, UI_THEME.accentNum, 0.5)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 41)
      .setVisible(false);
    this.thumb = this.scene.add
      .circle(0, 0, 24, UI_THEME.accentNum, 0.85)
      .setScrollFactor(0)
      .setDepth(UI_DEPTH + 42)
      .setVisible(false);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.pointerId !== null) {
      return;
    }
    // Reserve the right edge for the on-screen pause button.
    if (pointer.x > this.scene.scale.width * 0.82 && pointer.y < this.scene.scale.height * 0.18) {
      return;
    }

    this.pointerId = pointer.id;
    this.originX = pointer.x;
    this.originY = pointer.y;
    this.placeVisuals(this.originX, this.originY, this.originX, this.originY, true);
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (pointer.id !== this.pointerId) {
      return;
    }

    let dx = pointer.x - this.originX;
    let dy = pointer.y - this.originY;
    const dist = Math.hypot(dx, dy);
    if (dist > MAX_RADIUS) {
      dx = (dx / dist) * MAX_RADIUS;
      dy = (dy / dist) * MAX_RADIUS;
    }

    const magnitude = Math.min(1, dist / MAX_RADIUS);
    if (magnitude < DEAD_ZONE) {
      this.moveX = 0;
      this.moveY = 0;
    } else {
      const norm = dist || 1;
      this.moveX = (pointer.x - this.originX) / norm;
      this.moveY = (pointer.y - this.originY) / norm;
    }

    this.placeVisuals(this.originX, this.originY, this.originX + dx, this.originY + dy, true);
  }

  private onPointerUp(pointer: Phaser.Input.Pointer) {
    if (pointer.id !== this.pointerId) {
      return;
    }
    this.pointerId = null;
    this.moveX = 0;
    this.moveY = 0;
    this.placeVisuals(0, 0, 0, 0, false);
  }

  private placeVisuals(bx: number, by: number, tx: number, ty: number, visible: boolean) {
    this.ring?.setPosition(bx, by).setVisible(visible);
    this.base?.setPosition(bx, by).setVisible(visible);
    this.thumb?.setPosition(tx, ty).setVisible(visible);
  }

  destroy() {
    this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
    this.ring?.destroy();
    this.base?.destroy();
    this.thumb?.destroy();
  }
}
