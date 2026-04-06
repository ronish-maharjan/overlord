export const LEVEL_ROLE_MILESTONES = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
] as const;

export type LevelRoleMilestone = (typeof LEVEL_ROLE_MILESTONES)[number];

export function isValidLevelRoleMilestone(level: number): boolean {
  return LEVEL_ROLE_MILESTONES.includes(level as LevelRoleMilestone);
}
