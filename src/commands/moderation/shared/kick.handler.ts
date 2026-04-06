import type { GuildMember } from 'discord.js';
import { container } from '../../../container';
import { ModerationServiceError } from '../../../services/moderation/moderation.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import {
  ModerationTargetValidationError,
  validateModerationTarget,
} from '../../../utils/moderation/moderationChecks';
import {
  notifyModerationTarget,
  sendModerationLog,
} from '../../../utils/moderation/moderationNotifier';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleKick(params: {
  context: CommandContext;
  targetMember: GuildMember | null;
  reason: string;
}): Promise<void> {
  const { context, targetMember, reason } = params;

  if (!context.source.guild) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  if (!targetMember) {
    await context.reply({
      embeds: [createErrorEmbed('Could not find that member in this server.')],
    });
    return;
  }

  try {
    validateModerationTarget({
      guild: context.source.guild,
      moderatorMember: context.member,
      targetMember,
      targetUser: targetMember.user,
      action: 'kick',
    });

    const action = await container.moderationService.kick({
      guild: context.source.guild,
      targetMember,
      moderatorUser: context.user,
      reason,
      channelId: context.source.channelId,
      messageId: 'id' in context.source ? context.source.id : null,
    });

    await notifyModerationTarget({
      guild: context.source.guild,
      targetUser: targetMember.user,
      action,
    });

    await sendModerationLog({
      guild: context.source.guild,
      moderatorUser: context.user,
      targetUser: targetMember.user,
      action,
    });

    await context.reply({
      content: `Kicked **${targetMember.user.username}** (Case #${action.id}).`,
    });
  } catch (error) {
    if (
      error instanceof ModerationServiceError ||
      error instanceof ModerationTargetValidationError
    ) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to kick member:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while kicking that member.')],
    });
  }
}
