import { EmbedBuilder, User } from 'discord.js';
import { createBaseEmbed } from './baseEmbed';
import type { ModerationActionRecord } from '../../types/moderation';

function getActionDisplay(actionType: ModerationActionRecord['actionType']) {
  switch (actionType) {
    case 'warn':
      return { label: 'Warned', colorTitle: 'Warning Issued' };
    case 'kick':
      return { label: 'Kicked', colorTitle: 'Member Kicked' };
    case 'ban':
      return { label: 'Banned', colorTitle: 'Member Banned' };
    case 'unban':
      return { label: 'Unbanned', colorTitle: 'Member Unbanned' };
    case 'timeout':
      return { label: 'Timed Out', colorTitle: 'Member Timed Out' };
    case 'untimeout':
      return { label: 'Timeout Removed', colorTitle: 'Timeout Removed' };
    default:
      return { label: 'Action', colorTitle: 'Moderation Action' };
  }
}

export function createModerationUserDmEmbed(params: {
  actionType: ModerationActionRecord['actionType'];
  guildName: string;
  reason: string;
  expiresAt?: Date | null;
}): EmbedBuilder {
  const { actionType, guildName, reason, expiresAt } = params;
  const action = getActionDisplay(actionType);

  const embed = createBaseEmbed()
    .setTitle(action.colorTitle)
    .setDescription(`You have been **${action.label.toLowerCase()}** in **${guildName}**.`)
    .addFields({
      name: 'Reason',
      value: reason || 'No reason provided',
      inline: false,
    });

  if (expiresAt) {
    embed.addFields({
      name: 'Expires',
      value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:F>`,
      inline: false,
    });
  }

  return embed;
}

export function createModerationLogEmbed(params: {
  action: ModerationActionRecord;
  moderator: User;
  target: User;
}): EmbedBuilder {
  const { action, moderator, target } = params;
  const meta = getActionDisplay(action.actionType);

  const embed = createBaseEmbed()
    .setTitle(`${meta.label} • Case #${action.id}`)
    .setAuthor({
      name: `${moderator.tag}`,
      iconURL: moderator.displayAvatarURL(),
    })
    .setThumbnail(target.displayAvatarURL())
    .addFields(
      {
        name: 'Target',
        value: `${target} (\`${target.id}\`)`,
        inline: false,
      },
      {
        name: 'Reason',
        value: action.reason || 'No reason provided',
        inline: false,
      },
    )
    .setTimestamp(action.createdAt);

  if (action.expiresAt) {
    embed.addFields({
      name: 'Expires',
      value: `<t:${Math.floor(action.expiresAt.getTime() / 1000)}:F>`,
      inline: false,
    });
  }

  return embed;
}

export function createModerationCaseEmbed(params: {
  action: ModerationActionRecord;
  moderatorLabel: string;
  targetLabel: string;
}): EmbedBuilder {
  const { action, moderatorLabel, targetLabel } = params;
  const meta = getActionDisplay(action.actionType);

  const embed = createBaseEmbed()
    .setTitle(`${meta.label} • Case #${action.id}`)
    .addFields(
      {
        name: 'Target',
        value: targetLabel,
        inline: false,
      },
      {
        name: 'Moderator',
        value: moderatorLabel,
        inline: false,
      },
      {
        name: 'Reason',
        value: action.reason || 'No reason provided',
        inline: false,
      },
      {
        name: 'Created',
        value: `<t:${Math.floor(action.createdAt.getTime() / 1000)}:F>`,
        inline: false,
      },
    );

  if (action.expiresAt) {
    embed.addFields({
      name: 'Expires',
      value: `<t:${Math.floor(action.expiresAt.getTime() / 1000)}:F>`,
      inline: false,
    });
  }

  return embed;
}

export function createModerationHistoryEmbed(params: {
  targetLabel: string;
  lines: string[];
  page: number;
  totalPages: number;
}): EmbedBuilder {
  const { targetLabel, lines, page, totalPages } = params;

  return createBaseEmbed()
    .setTitle(`Moderation History • ${targetLabel}`)
    .setDescription(lines.length ? lines.join('\n\n') : 'No moderation history found.')
    .setFooter({
      text: `Page ${page} / ${totalPages}`,
    });
}
