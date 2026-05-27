import Phaser from "phaser";

type LabelEntry = {
  text: Phaser.GameObjects.Text;
  inUse: boolean;
};

type ShowOpts = {
  value: number;
  heavy: boolean;
  startX: number;
  startY: number;
  driftX: number;
  colorOverride: string;
};

const POOL_KEY = "__damageNumberPool";
const MAX_POOL = 64;

function getPool(scene: Phaser.Scene): LabelEntry[] {
  const reg = scene.registry;
  let pool = reg.get(POOL_KEY) as LabelEntry[] | undefined;
  if (!pool) {
    pool = [];
    reg.set(POOL_KEY, pool);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const entry of pool!) {
        entry.text.destroy();
      }
      reg.set(POOL_KEY, undefined);
    });
  }
  return pool;
}

function acquire(scene: Phaser.Scene): LabelEntry {
  const pool = getPool(scene);
  for (let i = 0; i < pool.length; i += 1) {
    if (!pool[i].inUse) {
      pool[i].inUse = true;
      return pool[i];
    }
  }
  if (pool.length >= MAX_POOL) {
    const oldest = pool[0];
    oldest.inUse = true;
    return oldest;
  }
  const text = scene.add
    .text(0, 0, "", {
      fontFamily: "Inter, Arial",
      fontSize: "18px",
      color: "#ffffff",
      fontStyle: "800",
      stroke: "#090b10",
      strokeThickness: 5,
    })
    .setOrigin(0.5)
    .setDepth(220);
  text.setResolution(2);
  text.setActive(false).setVisible(false);
  const entry: LabelEntry = { text, inUse: true };
  pool.push(entry);
  return entry;
}

export const DamageNumberPool = {
  show(scene: Phaser.Scene, opts: ShowOpts) {
    const entry = acquire(scene);
    const label = entry.text;
    scene.tweens.killTweensOf(label);
    label.setText(`${opts.value}`);
    label.setFontSize(opts.heavy ? 22 : 18);
    label.setColor(opts.colorOverride);
    label.setPosition(opts.startX, opts.startY);
    label.setAlpha(1);
    label.setScale(0.82);
    label.setActive(true).setVisible(true);

    scene.tweens.add({
      targets: label,
      x: opts.startX + opts.driftX,
      y: opts.startY - 38,
      alpha: 0,
      scale: opts.heavy ? 1.24 : 1.08,
      duration: 540,
      ease: "Quad.easeOut",
      onComplete: () => {
        label.setActive(false).setVisible(false);
        entry.inUse = false;
      },
    });
  },
};
