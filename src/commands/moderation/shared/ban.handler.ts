import type { GuildMember, User } from 'discord.js';
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

export async function handleBan(params: {
  context: CommandContext;
  targetUser: User;
  targetMember?: GuildMember | null;
  reason: string;
}): Promise<void> {
  const { context, targetUser, targetMember, reason } = params;

  if (!context.source.guild) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
      ephemeral: true,
    });
    return;
  }

  try {
    validateModerationTarget({
      guild: context.source.guild,
      moderatorMember: context.member,
      targetMember: targetMember ?? null,
      targetUser,
      action: 'ban',
    });

    const action = await container.moderationService.ban({
      guild: context.source.guild,
      targetUser,
      moderatorUser: context.user,
      reason,
      channelId: context.source.channelId,
      messageId: 'id' in context.source ? context.source.id : null,
    });

    await notifyModerationTarget({
      guild: context.source.guild,
      targetUser,
      action,
    });

    await sendModerationLog({
      guild: context.source.guild,
      moderatorUser: context.user,
      targetUser,
      action,
    });

    await context.reply({
      content: `Banned **${targetUser.username}** (Case #${action.id}).`,
    });
  } catch (error) {
    if (
      error instanceof ModerationServiceError ||
      error instanceof ModerationTargetValidationError
    ) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
        ephemeral: true,
      });
      return;
    }

    console.error('Failed to ban user:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while banning that user.')],
      ephemeral: true,
    });
  }
}
