export interface VerificationSettingsConfig {
  guildId: string;
  verifiedRoleId: string | null;
  verifyChannelId: string | null;
  verifyMessageId: string | null;
}

export interface VerificationSetupStatus {
  hasVerifiedRole: boolean;
  hasVerifyChannel: boolean;
  isFullyConfigured: boolean;
}
