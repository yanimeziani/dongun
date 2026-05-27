export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function secondsToClock(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function angleToVector(angle: number) {
  return new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle));
}

export function formatGold(value: number) {
  return Math.floor(value).toLocaleString("en-US");
}
