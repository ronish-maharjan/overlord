import { VerificationSettingsRepository } from '../../repositories/verification/verificationSettings.repository';
import type {
  VerificationSettingsConfig,
  VerificationSetupStatus,
} from '../../types/verification';

export class VerificationServiceError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'VerificationServiceError';
    this.code = code;
  }
}

export class VerificationService {
  constructor(
    private readonly verificationSettingsRepository: VerificationSettingsRepository,
  ) {}

  async getSettings(guildId: string | null): Promise<VerificationSettingsConfig> {
    if (!guildId) {
      throw new VerificationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings =
      await this.verificationSettingsRepository.ensureAndGetGuildSettings(guildId);

    if (!settings) {
      throw new VerificationServiceError(
        'SETTINGS_NOT_FOUND',
        'Could not load verification settings.',
      );
    }

    return {
      guildId: settings.guildId,
      verifiedRoleId: settings.verifiedRoleId ?? null,
      verifyChannelId: settings.verifyChannelId ?? null,
      verifyMessageId: settings.verifyMessageId ?? null,
    };
  }

  async setVerifiedRole(params: {
    guildId: string | null;
    roleId: string;
    now?: Date;
  }): Promise<VerificationSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new VerificationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.verificationSettingsRepository.setVerifiedRole({
      guildId: params.guildId,
      roleId: params.roleId,
      now,
    });

    return {
      guildId: settings.guildId,
      verifiedRoleId: settings.verifiedRoleId ?? null,
      verifyChannelId: settings.verifyChannelId ?? null,
      verifyMessageId: settings.verifyMessageId ?? null,
    };
  }

  async removeVerifiedRole(params: {
    guildId: string | null;
    now?: Date;
  }): Promise<VerificationSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new VerificationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.verificationSettingsRepository.removeVerifiedRole(
      params.guildId,
      now,
    );

    return {
      guildId: settings.guildId,
      verifiedRoleId: settings.verifiedRoleId ?? null,
      verifyChannelId: settings.verifyChannelId ?? null,
      verifyMessageId: settings.verifyMessageId ?? null,
    };
  }

  async setVerifyChannel(params: {
    guildId: string | null;
    channelId: string;
    now?: Date;
  }): Promise<VerificationSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new VerificationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.verificationSettingsRepository.setVerifyChannel({
      guildId: params.guildId,
      channelId: params.channelId,
      now,
    });

    return {
      guildId: settings.guildId,
      verifiedRoleId: settings.verifiedRoleId ?? null,
      verifyChannelId: settings.verifyChannelId ?? null,
      verifyMessageId: settings.verifyMessageId ?? null,
    };
  }

  async removeVerifyChannel(params: {
    guildId: string | null;
    now?: Date;
  }): Promise<VerificationSettingsConfig> {
    const now = params.now ?? new Date();

    if (!params.guildId) {
      throw new VerificationServiceError(
        'GUILD_ONLY',
        'This command can only be used inside a server.',
      );
    }

    const settings = await this.verificationSettingsRepository.removeVerifyChannel(
      params.guildId,
      now,
    );

    return {
      guildId: settings.guildId,
      verifiedRoleId: settings.verifiedRoleId ?? null,
      verifyChannelId: settings.verifyChannelId ?? null,
      verifyMessageId: settings.verifyMessageId ?? null,
    };
  }

  async setVerifyMessage(params: {
    guildId: string;
    messageId: string | null;
    now?: Date;
  }): Promise<VerificationSettingsConfig> {
    const now = params.now ?? new Date();

    const settings = await this.verificationSettingsRepository.setVerifyMessage({
      guildId: params.guildId,
      messageId: params.messageId,
      now,
    });

    return {
      guildId: settings.guildId,
      verifiedRoleId: settings.verifiedRoleId ?? null,
      verifyChannelId: settings.verifyChannelId ?? null,
      verifyMessageId: settings.verifyMessageId ?? null,
    };
  }

  async getSetupStatus(guildId: string | null): Promise<VerificationSetupStatus> {
    const settings = await this.getSettings(guildId);

    const hasVerifiedRole = Boolean(settings.verifiedRoleId);
    const hasVerifyChannel = Boolean(settings.verifyChannelId);

    return {
      hasVerifiedRole,
      hasVerifyChannel,
      isFullyConfigured: hasVerifiedRole && hasVerifyChannel,
    };
  }

  async canSendVerifyMessage(guildId: string | null): Promise<boolean> {
    const status = await this.getSetupStatus(guildId);
    return status.isFullyConfigured;
  }
}
