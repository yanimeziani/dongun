import Phaser from "phaser";

export type VisibleGameArea = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export function getVisibleGameArea(scene: Phaser.Scene): VisibleGameArea {
  const designW = scene.cameras.main.width;
  const designH = scene.cameras.main.height;
  const displayW = scene.scale.displaySize.width || designW;
  const displayH = scene.scale.displaySize.height || designH;
  const parentW = scene.scale.parentSize.width || displayW;
  const parentH = scene.scale.parentSize.height || displayH;
  const scaleX = displayW / designW;
  const scaleY = displayH / designH;
  const scale = Math.max(scaleX, scaleY, 0.0001);
  const visibleW = Math.min(designW, parentW / scale);
  const visibleH = Math.min(designH, parentH / scale);
  const left = Math.round((designW - visibleW) / 2);
  const top = Math.round((designH - visibleH) / 2);

  return {
    left,
    top,
    right: Math.round(designW - left),
    bottom: Math.round(designH - top),
    width: Math.round(visibleW),
    height: Math.round(visibleH),
  };
}
