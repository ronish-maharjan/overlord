export interface LevelProfile {
  guildId: string;
  userId: string;
  xp: number;
  level: number;
  messageCount: number;
  rank: number | null;
  progressXp: number;
  requiredXp: number;
}

export interface LevelLeaderboardEntry {
  userId: string;
  xp: number;
  level: number;
  rank: number;
}

export interface AwardXpResult {
  guildId: string;
  userId: string;
  xpAwarded: number;
  totalXp: number;
  oldLevel: number;
  newLevel: number;
  leveledUp: boolean;
  skippedDueToCooldown: boolean;
}

export interface LevelRoleReward {
  guildId: string;
  level: number;
  roleId: string;
}

export interface LevelSettingsConfig {
  guildId: string;
  levelLogsChannelId: string | null;
}

export interface SyncLevelRolesResult {
  addedRoleIds: string[];
  removedRoleIds: string[];
}
