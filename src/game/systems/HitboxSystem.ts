import Phaser from "phaser";

export type CircleHitbox = {
  x: number;
  y: number;
  radius: number;
};

export type SweepHitbox = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  radius: number;
};

const EPSILON = 0.000001;

export function hitboxesOverlap(a: CircleHitbox, b: CircleHitbox) {
  const radius = a.radius + b.radius;
  return distanceSquared(a.x, a.y, b.x, b.y) <= radius * radius;
}

export function sweepCircleHitTime(sweep: SweepHitbox, target: CircleHitbox) {
  const dx = sweep.toX - sweep.fromX;
  const dy = sweep.toY - sweep.fromY;
  const combinedRadius = sweep.radius + target.radius;
  const startX = sweep.fromX - target.x;
  const startY = sweep.fromY - target.y;
  const c = startX * startX + startY * startY - combinedRadius * combinedRadius;

  if (c <= 0) {
    return 0;
  }

  const a = dx * dx + dy * dy;
  if (a <= EPSILON) {
    return null;
  }

  const b = 2 * (startX * dx + startY * dy);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) {
    return null;
  }

  const impactTime = (-b - Math.sqrt(discriminant)) / (2 * a);
  return impactTime >= 0 && impactTime <= 1 ? impactTime : null;
}

export function arcCircleOverlap(
  origin: { x: number; y: number },
  angle: number,
  range: number,
  halfAngle: number,
  target: CircleHitbox,
) {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > range + target.radius) {
    return false;
  }

  if (distance <= target.radius) {
    return true;
  }

  const targetAngle = Math.atan2(dy, dx);
  const angleDelta = Math.abs(Phaser.Math.Angle.Wrap(targetAngle - angle));
  const angularPadding = Math.asin(Phaser.Math.Clamp(target.radius / Math.max(distance, EPSILON), 0, 1));
  return angleDelta <= halfAngle + angularPadding;
}

function distanceSquared(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}
