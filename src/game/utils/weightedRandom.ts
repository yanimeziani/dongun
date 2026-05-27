export type WeightedItem<T> = {
  item: T;
  weight: number;
};

export function weightedRandom<T>(items: WeightedItem<T>[]): T {
  const total = items.reduce((sum, entry) => sum + Math.max(0, entry.weight), 0);
  let roll = Math.random() * total;

  for (const entry of items) {
    roll -= Math.max(0, entry.weight);
    if (roll <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1].item;
}
