export function minXpAt(level: number): number {
  return Math.floor(((2 * level * level + 27 * level + 91) * level * 5) / 6);
}

export function calculateLevelFromXp(xp: number): number {
  let level = 0;

  while (xp >= minXpAt(level + 1)) {
    level += 1;
  }

  return level;
}

export function getProgressXp(xp: number, level: number): number {
  return xp - minXpAt(level);
}

export function getRequiredXpForNextLevel(level: number): number {
  return minXpAt(level + 1) - minXpAt(level);
}
