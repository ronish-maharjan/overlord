export const LEVEL_XP_CONFIG = {
  MIN_XP_PER_MESSAGE: 15,
  MAX_XP_PER_MESSAGE: 25,
} as const;

export function getRandomXpGain(): number {
  const min = LEVEL_XP_CONFIG.MIN_XP_PER_MESSAGE;
  const max = LEVEL_XP_CONFIG.MAX_XP_PER_MESSAGE;

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
