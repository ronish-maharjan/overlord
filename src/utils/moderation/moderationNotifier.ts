import type { Guild, User } from 'discord.js';
import { container } from '../../container';
import type { ModerationActionRecord } from '../../types/moderation';
import {
  createModerationLogEmbed,
  createModerationUserDmEmbed,
} from '../embeds/moderationEmbeds';

export async function notifyModerationTarget(params: {
  guild: Guild;
  targetUser: User;
  action: ModerationActionRecord;
}): Promise<void> {
  const { guild, targetUser, action } = params;

  if (!['warn', 'kick', 'ban', 'timeout'].includes(action.actionType)) {
    return;
  }

  try {
    await targetUser.send({
      embeds: [
        createModerationUserDmEmbed({
          actionType: action.actionType,
          guildName: guild.name,
          reason: action.reason,
          expiresAt: action.expiresAt,
        }),
      ],
    });
  } catch {
    // Ignore DM failures silently
  }
}

export async function sendModerationLog(params: {
  guild: Guild;
  moderatorUser: User;
  targetUser: User;
  action: ModerationActionRecord;
}): Promise<void> {
  const { guild, moderatorUser, targetUser, action } = params;

  const settings = await container.moderationSettingsService.getSettings(guild.id);

  if (!settings.modLogsChannelId) {
    return;
  }

  const channel = await guild.channels.fetch(settings.modLogsChannelId).catch(() => null);

  if (!channel || !('send' in channel)) {
    return;
  }

  await channel.send({
    embeds: [
      createModerationLogEmbed({
        action,
        moderator: moderatorUser,
        target: targetUser,
      }),
    ],
  });
}
