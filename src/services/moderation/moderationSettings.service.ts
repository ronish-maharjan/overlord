import { ModerationSettingsRepository } from '../../repositories/moderation/moderationSettings.repository';
import type { ModerationSettingsConfig } from '../../types/moderation';

export class ModerationSettingsServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ModerationSettingsServiceError';
    this.code = code;
  }
}

export class ModerationSettingsService {
  constructor(
    private readonly moderationSettingsRepository: ModerationSettingsRepository,
  ) {}

  async getSettings(guildId: string | null): Promise<ModerationSettingsConfig> {
    if (!guildId) {
      throw new ModerationSettingsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings =
      await this.moderationSettingsRepository.ensureAndGetGuildSettings(guildId);

    if (!settings) {
      throw new ModerationSettingsServiceError(
        'SETTINGS_NOT_FOUND',
        'Could not load moderation settings.',
      );
    }

    return {
      guildId: settings.guildId,
      modLogsChannelId: settings.modLogsChannelId ?? null,
    };
  }

  async setModLogsChannel(params: {
    guildId: string | null;
    channelId: string;
    now?: Date;
  }): Promise<ModerationSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new ModerationSettingsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.moderationSettingsRepository.setModLogsChannel({
      guildId: params.guildId,
      channelId: params.channelId,
      now,
    });

    return {
      guildId: settings.guildId,
      modLogsChannelId: settings.modLogsChannelId ?? null,
    };
  }

  async removeModLogsChannel(params: {
    guildId: string | null;
    now?: Date;
  }): Promise<ModerationSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new ModerationSettingsServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.moderationSettingsRepository.removeModLogsChannel(
      params.guildId,
      now,
    );

    return {
      guildId: settings.guildId,
      modLogsChannelId: settings.modLogsChannelId ?? null,
    };
  }
}
