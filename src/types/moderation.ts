export type ModerationActionType =
  | 'warn'
  | 'kick'
  | 'ban'
  | 'unban'
  | 'timeout'
  | 'untimeout';

export interface ModerationActionRecord {
  id: number;
  guildId: string;
  targetUserId: string;
  moderatorUserId: string;
  actionType: ModerationActionType;
  reason: string;
  createdAt: Date;
  expiresAt: Date | null;
  resolved: boolean;
  channelId: string | null;
  messageId: string | null;
}

export interface ModerationSettingsConfig {
  guildId: string;
  modLogsChannelId: string | null;
}

export interface ModerationHistoryEntry {
  id: number;
  targetUserId: string;
  moderatorUserId: string;
  actionType: ModerationActionType;
  reason: string;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface ModerationCaseDetail extends ModerationActionRecord {}

export interface CreateModerationActionInput {
  guildId: string;
  targetUserId: string;
  moderatorUserId: string;
  actionType: ModerationActionType;
  reason: string;
  createdAt?: Date;
  expiresAt?: Date | null;
  resolved?: boolean;
  channelId?: string | null;
  messageId?: string | null;
}
