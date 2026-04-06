import { REP_CONSTANTS } from '../../config/constants';
import { LevelRoleRewardsRepository } from '../../repositories/levels/levelRoleRewards.repository';
import { LevelSettingsRepository } from '../../repositories/levels/levelSettings.repository';
import { LevelsRepository } from '../../repositories/levels/levels.repository';
import type {
  AwardXpResult,
  LevelLeaderboardEntry,
  LevelProfile,
  LevelRoleReward,
  LevelSettingsConfig,
  SyncLevelRolesResult,
} from '../../types/levels';
import {
  calculateLevelFromXp,
  getProgressXp,
  getRequiredXpForNextLevel,
  minXpAt,
} from '../../utils/levels/levelMath';
import { isValidLevelRoleMilestone } from '../../utils/levels/levelMilestones';

const MESSAGE_XP_COOLDOWN_MS = 60_000;

export class LevelsServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'LevelsServiceError';
    this.code = code;
  }
}

export class LevelsService {
  constructor(
    private readonly levelsRepository: LevelsRepository,
    private readonly levelRoleRewardsRepository: LevelRoleRewardsRepository,
    private readonly levelSettingsRepository: LevelSettingsRepository,
  ) {}

  async getLevelProfile(params: {
    guildId: string | null;
    userId: string;
  }): Promise<LevelProfile> {
    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const stats = await this.levelsRepository.ensureAndGetUserStats(
      params.guildId,
      params.userId,
    );

    if (!stats) {
      throw new LevelsServiceError(
        'PROFILE_NOT_FOUND',
        'Could not load level profile.',
      );
    }

    const rank = await this.levelsRepository.getUserRank(
      params.guildId,
      params.userId,
    );

    return {
      guildId: stats.guildId,
      userId: stats.userId,
      xp: stats.xp,
      level: stats.level,
      messageCount: stats.messageCount,
      rank,
      progressXp: getProgressXp(stats.xp, stats.level),
      requiredXp: getRequiredXpForNextLevel(stats.level),
    };
  }

  async awardXp(params: {
    guildId: string | null;
    userId: string;
    xpToAdd: number;
    now?: Date;
  }): Promise<AwardXpResult> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'XP can only be awarded inside a server.',
      );
    }

    if (params.xpToAdd <= 0) {
      throw new LevelsServiceError(
        'INVALID_XP_AMOUNT',
        'XP awarded must be greater than zero.',
      );
    }

    const beforeStats = await this.levelsRepository.ensureAndGetUserStats(
      params.guildId,
      params.userId,
    );

    if (!beforeStats) {
      throw new LevelsServiceError(
        'PROFILE_NOT_FOUND',
        'Could not load level profile before XP award.',
      );
    }

    if (beforeStats.lastXpGainedAt) {
      const diff = now.getTime() - beforeStats.lastXpGainedAt.getTime();

      if (diff < MESSAGE_XP_COOLDOWN_MS) {
        return {
          guildId: params.guildId,
          userId: params.userId,
          xpAwarded: 0,
          totalXp: beforeStats.xp,
          oldLevel: beforeStats.level,
          newLevel: beforeStats.level,
          leveledUp: false,
          skippedDueToCooldown: true,
        };
      }
    }

    const updatedStats = await this.levelsRepository.addXp({
      guildId: params.guildId,
      userId: params.userId,
      xpToAdd: params.xpToAdd,
      messageCountToAdd: 1,
      now,
    });

    const oldLevel = beforeStats.level;
    const newLevel = calculateLevelFromXp(updatedStats.xp);
    const leveledUp = newLevel > oldLevel;

    if (leveledUp) {
      await this.levelsRepository.updateLevel({
        guildId: params.guildId,
        userId: params.userId,
        level: newLevel,
        now,
      });
    }

    return {
      guildId: params.guildId,
      userId: params.userId,
      xpAwarded: params.xpToAdd,
      totalXp: updatedStats.xp,
      oldLevel,
      newLevel,
      leveledUp,
      skippedDueToCooldown: false,
    };
  }

  async setLevel(params: {
    guildId: string | null;
    userId: string;
    level: number;
    now?: Date;
  }): Promise<{
    oldLevel: number;
    newLevel: number;
    xp: number;
  }> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    if (params.level < 0) {
      throw new LevelsServiceError(
        'INVALID_LEVEL',
        'Level cannot be negative.',
      );
    }

    const existingStats = await this.levelsRepository.ensureAndGetUserStats(
      params.guildId,
      params.userId,
    );

    if (!existingStats) {
      throw new LevelsServiceError(
        'PROFILE_NOT_FOUND',
        'Could not load level profile.',
      );
    }

    const xp = minXpAt(params.level);

    await this.levelsRepository.setXpAndLevel({
      guildId: params.guildId,
      userId: params.userId,
      xp,
      level: params.level,
      now,
    });

    return {
      oldLevel: existingStats.level,
      newLevel: params.level,
      xp,
    };
  }

  async getLeaderboard(params: {
    guildId: string | null;
    page?: number;
    pageSize?: number;
  }): Promise<{
    entries: LevelLeaderboardEntry[];
    page: number;
    totalPages: number;
    totalUsers: number;
    pageSize: number;
  }> {
    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const pageSize = params.pageSize ?? REP_CONSTANTS.LEADERBOARD_PAGE_SIZE;
    const requestedPage = Math.max(1, params.page ?? 1);

    const totalUsers = await this.levelsRepository.countLeaderboardUsers(
      params.guildId,
    );
    const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize));
    const page = Math.min(requestedPage, totalPages);

    const entries = await this.levelsRepository.getLeaderboardPage({
      guildId: params.guildId,
      page,
      pageSize,
    });

    return {
      entries,
      page,
      totalPages,
      totalUsers,
      pageSize,
    };
  }

  async setLevelRoleReward(params: {
    guildId: string | null;
    level: number;
    roleId: string;
    now?: Date;
  }): Promise<LevelRoleReward> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    if (!isValidLevelRoleMilestone(params.level)) {
      throw new LevelsServiceError(
        'INVALID_LEVEL_MILESTONE',
        'That level is not a valid reward milestone.',
      );
    }

    const reward = await this.levelRoleRewardsRepository.setLevelRoleReward({
      guildId: params.guildId,
      level: params.level,
      roleId: params.roleId,
      now,
    });

    return {
      guildId: reward.guildId,
      level: reward.level,
      roleId: reward.roleId,
    };
  }

  async removeLevelRoleReward(params: {
    guildId: string | null;
    level: number;
  }): Promise<LevelRoleReward | null> {
    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    if (!isValidLevelRoleMilestone(params.level)) {
      throw new LevelsServiceError(
        'INVALID_LEVEL_MILESTONE',
        'That level is not a valid reward milestone.',
      );
    }

    const reward = await this.levelRoleRewardsRepository.removeLevelRoleReward(
      params.guildId,
      params.level,
    );

    if (!reward) return null;

    return {
      guildId: reward.guildId,
      level: reward.level,
      roleId: reward.roleId,
    };
  }

  async getLevelRoleRewards(guildId: string | null): Promise<LevelRoleReward[]> {
    if (!guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const rewards =
      await this.levelRoleRewardsRepository.getGuildLevelRoleRewards(guildId);

    return rewards.map((reward) => ({
      guildId: reward.guildId,
      level: reward.level,
      roleId: reward.roleId,
    }));
  }

  async setLevelLogsChannel(params: {
    guildId: string | null;
    channelId: string;
    now?: Date;
  }): Promise<LevelSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.levelSettingsRepository.setLevelLogsChannel({
      guildId: params.guildId,
      channelId: params.channelId,
      now,
    });

    return {
      guildId: settings.guildId,
      levelLogsChannelId: settings.levelLogsChannelId ?? null,
    };
  }

  async removeLevelLogsChannel(params: {
    guildId: string | null;
    now?: Date;
  }): Promise<LevelSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.levelSettingsRepository.removeLevelLogsChannel(
      params.guildId,
      now,
    );

    return {
      guildId: settings.guildId,
      levelLogsChannelId: settings.levelLogsChannelId ?? null,
    };
  }

  async getLevelSettings(guildId: string | null): Promise<LevelSettingsConfig> {
    if (!guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.levelSettingsRepository.ensureAndGetGuildSettings(
      guildId,
    );

    if (!settings) {
      throw new LevelsServiceError(
        'SETTINGS_NOT_FOUND',
        'Could not load level settings.',
      );
    }

    return {
      guildId: settings.guildId,
      levelLogsChannelId: settings.levelLogsChannelId ?? null,
    };
  }

  async getRewardRoleIdForLevel(
    guildId: string,
    level: number,
  ): Promise<string | null> {
    const reward = await this.levelRoleRewardsRepository.getLevelRoleReward(
      guildId,
      level,
    );

    return reward?.roleId ?? null;
  }

  async getRewardRoleIdsUpToLevel(
    guildId: string,
    level: number,
  ): Promise<string[]> {
    const rewards = await this.levelRoleRewardsRepository.getRewardsUpToLevel(
      guildId,
      level,
    );

    return rewards.map((reward) => reward.roleId);
  }

  async getRoleSyncPlan(params: {
    guildId: string | null;
    currentLevel: number;
    currentRoleIds: string[];
  }): Promise<SyncLevelRolesResult> {
    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'Role sync can only run inside a server.',
      );
    }

    const expectedRoleIds = await this.getRewardRoleIdsUpToLevel(
      params.guildId,
      params.currentLevel,
    );

    const currentSet = new Set(params.currentRoleIds);

    const addedRoleIds = expectedRoleIds.filter((roleId) => !currentSet.has(roleId));

    return {
      addedRoleIds,
      removedRoleIds: [],
    };
  }

  async getStrictRoleSyncPlan(params: {
    guildId: string | null;
    targetLevel: number;
    currentRoleIds: string[];
  }): Promise<SyncLevelRolesResult> {
    if (!params.guildId) {
      throw new LevelsServiceError(
        'GUILD_ONLY',
        'Role sync can only run inside a server.',
      );
    }

    const allRewards = await this.levelRoleRewardsRepository.getGuildLevelRoleRewards(
      params.guildId,
    );

    const expectedRoleIds = allRewards
      .filter((reward) => reward.level <= params.targetLevel)
      .map((reward) => reward.roleId);

    const removableRoleIds = allRewards
      .filter((reward) => reward.level > params.targetLevel)
      .map((reward) => reward.roleId);

    const currentSet = new Set(params.currentRoleIds);
    const expectedSet = new Set(expectedRoleIds);
    const removableSet = new Set(removableRoleIds);

    const addedRoleIds = expectedRoleIds.filter((roleId) => !currentSet.has(roleId));
    const removedRoleIds = params.currentRoleIds.filter((roleId) =>
      removableSet.has(roleId) && !expectedSet.has(roleId),
    );

    return {
      addedRoleIds,
      removedRoleIds,
    };
  }
}
