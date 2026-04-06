import type { Guild, GuildMember, User } from 'discord.js';
import { ModerationRepository } from '../../repositories/moderation/moderation.repository';
import { ModerationSettingsRepository } from '../../repositories/moderation/moderationSettings.repository';
import type {
  ModerationActionRecord,
  ModerationActionType,
} from '../../types/moderation';

export class ModerationServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ModerationServiceError';
    this.code = code;
  }
}

export class ModerationService {
  constructor(
    private readonly moderationRepository: ModerationRepository,
    private readonly moderationSettingsRepository: ModerationSettingsRepository,
  ) {}

  async warn(params: {
    guildId: string | null;
    targetUserId: string;
    moderatorUserId: string;
    reason: string;
    channelId?: string | null;
    messageId?: string | null;
    now?: Date;
  }): Promise<ModerationActionRecord> {
    return this.createCase({
      guildId: params.guildId,
      targetUserId: params.targetUserId,
      moderatorUserId: params.moderatorUserId,
      actionType: 'warn',
      reason: params.reason,
      channelId: params.channelId,
      messageId: params.messageId,
      now: params.now,
    });
  }

  async kick(params: {
    guild: Guild | null;
    targetMember: GuildMember;
    moderatorUser: User;
    reason: string;
    channelId?: string | null;
    messageId?: string | null;
    now?: Date;
  }): Promise<ModerationActionRecord> {
    const now = params.now ?? new Date();

    if (!params.guild) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    await params.targetMember.kick(params.reason);

    return this.createCase({
      guildId: params.guild.id,
      targetUserId: params.targetMember.id,
      moderatorUserId: params.moderatorUser.id,
      actionType: 'kick',
      reason: params.reason,
      channelId: params.channelId,
      messageId: params.messageId,
      now,
    });
  }

  async ban(params: {
    guild: Guild | null;
    targetUser: User;
    moderatorUser: User;
    reason: string;
    channelId?: string | null;
    messageId?: string | null;
    now?: Date;
  }): Promise<ModerationActionRecord> {
    const now = params.now ?? new Date();

    if (!params.guild) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    await params.guild.members.ban(params.targetUser.id, {
      reason: params.reason,
    });

    return this.createCase({
      guildId: params.guild.id,
      targetUserId: params.targetUser.id,
      moderatorUserId: params.moderatorUser.id,
      actionType: 'ban',
      reason: params.reason,
      channelId: params.channelId,
      messageId: params.messageId,
      now,
    });
  }

  async unban(params: {
    guild: Guild | null;
    targetUser: User;
    moderatorUser: User;
    reason: string;
    channelId?: string | null;
    messageId?: string | null;
    now?: Date;
  }): Promise<ModerationActionRecord> {
    const now = params.now ?? new Date();

    if (!params.guild) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    await params.guild.members.unban(params.targetUser.id, params.reason);

    return this.createCase({
      guildId: params.guild.id,
      targetUserId: params.targetUser.id,
      moderatorUserId: params.moderatorUser.id,
      actionType: 'unban',
      reason: params.reason,
      channelId: params.channelId,
      messageId: params.messageId,
      now,
    });
  }

  async timeout(params: {
    guildId: string | null;
    targetMember: GuildMember;
    moderatorUser: User;
    reason: string;
    expiresAt: Date;
    channelId?: string | null;
    messageId?: string | null;
    now?: Date;
  }): Promise<ModerationActionRecord> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    if (!(params.expiresAt instanceof Date) || Number.isNaN(params.expiresAt.getTime())) {
      throw new ModerationServiceError(
        'INVALID_TIMEOUT_DURATION',
        'Timeout duration is invalid.',
      );
    }

    if (params.expiresAt <= now) {
      throw new ModerationServiceError(
        'INVALID_TIMEOUT_DURATION',
        'Timeout duration must be in the future.',
      );
    }

    const maxTimeoutMs = 28 * 24 * 60 * 60 * 1000;
    if (params.expiresAt.getTime() - now.getTime() > maxTimeoutMs) {
      throw new ModerationServiceError(
        'TIMEOUT_TOO_LONG',
        'Timeout duration cannot exceed 28 days.',
      );
    }

    await params.targetMember.disableCommunicationUntil(params.expiresAt, params.reason);

    return this.createCase({
      guildId: params.guildId,
      targetUserId: params.targetMember.id,
      moderatorUserId: params.moderatorUser.id,
      actionType: 'timeout',
      reason: params.reason,
      channelId: params.channelId,
      messageId: params.messageId,
      expiresAt: params.expiresAt,
      resolved: false,
      now,
    });
  }

  async untimeout(params: {
    guildId: string | null;
    targetMember: GuildMember;
    moderatorUser: User;
    reason: string;
    channelId?: string | null;
    messageId?: string | null;
    now?: Date;
  }): Promise<ModerationActionRecord> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    await params.targetMember.disableCommunicationUntil(null, params.reason);

    return this.createCase({
      guildId: params.guildId,
      targetUserId: params.targetMember.id,
      moderatorUserId: params.moderatorUser.id,
      actionType: 'untimeout',
      reason: params.reason,
      channelId: params.channelId,
      messageId: params.messageId,
      now,
    });
  }

  async getCase(guildId: string | null, caseId: number) {
    if (!guildId) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    return this.moderationRepository.getCaseById(guildId, caseId);
  }

  async getHistory(params: {
    guildId: string | null;
    targetUserId: string;
    page: number;
    pageSize: number;
  }) {
    if (!params.guildId) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const totalEntries = await this.moderationRepository.countHistoryEntries(
      params.guildId,
      params.targetUserId,
    );

    const totalPages = Math.max(1, Math.ceil(totalEntries / params.pageSize));
    const page = Math.min(Math.max(1, params.page), totalPages);

    const entries = await this.moderationRepository.getHistoryPage({
      guildId: params.guildId,
      targetUserId: params.targetUserId,
      page,
      pageSize: params.pageSize,
    });

    return {
      entries,
      totalEntries,
      totalPages,
      page,
      pageSize: params.pageSize,
    };
  }

  async getModerationSettings(guildId: string | null) {
    if (!guildId) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings =
      await this.moderationSettingsRepository.ensureAndGetGuildSettings(guildId);

    if (!settings) {
      throw new ModerationServiceError(
        'SETTINGS_NOT_FOUND',
        'Could not load moderation settings.',
      );
    }

    return settings;
  }

  private async createCase(params: {
    guildId: string | null;
    targetUserId: string;
    moderatorUserId: string;
    actionType: ModerationActionType;
    reason: string;
    channelId?: string | null;
    messageId?: string | null;
    expiresAt?: Date | null;
    resolved?: boolean;
    now?: Date;
  }): Promise<ModerationActionRecord> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new ModerationServiceError(
        'GUILD_ONLY',
        'This action can only be created inside a server.',
      );
    }

    const reason = params.reason.trim() || 'No reason provided';

    return this.moderationRepository.createAction({
      guildId: params.guildId,
      targetUserId: params.targetUserId,
      moderatorUserId: params.moderatorUserId,
      actionType: params.actionType,
      reason,
      channelId: params.channelId ?? null,
      messageId: params.messageId ?? null,
      expiresAt: params.expiresAt ?? null,
      resolved: params.resolved ?? true,
      createdAt: now,
    });
  }
}
