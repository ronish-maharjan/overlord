import type { GuildMember } from 'discord.js';
import { container } from '../../../container';
import { RepServiceError } from '../../../services/rep/rep.service';
import { CommandContext } from '../../../utils/discord/commandContext';
import {
  createCannotRepBotMessage,
  createCannotRepSelfMessage,
  createGiveRepCooldownMessage,
  createGiveRepSuccessMessage,
  createGuildOnlyRepMessage,
  createMemberNotFoundMessage,
} from '../../../utils/messages/repMessages';

export async function handleGiveRep(params: {
  context: CommandContext;
  receiverMember: GuildMember | null;
}): Promise<void> {
  const { context, receiverMember } = params;

  if (!context.guildId) {
    await context.reply({
      content: createGuildOnlyRepMessage(),
    });
    return;
  }

  if (!receiverMember) {
    await context.reply({
      content: createMemberNotFoundMessage(),
    });
    return;
  }

  try {
    await container.repService.giveRep({
      guildId: context.guildId,
      giverUserId: context.user.id,
      receiverUserId: receiverMember.user.id,
      receiverIsBot: receiverMember.user.bot,
    });

    await context.reply({
      content: createGiveRepSuccessMessage(receiverMember.user.username),
    });
  } catch (error) {
    if (error instanceof RepServiceError) {
      if (error.code === 'COOLDOWN_ACTIVE') {
        const cooldown = await container.repService.getCooldownStatus(
          context.guildId,
          context.user.id,
          receiverMember.user.id,
        );

        await context.reply({
          content: createGiveRepCooldownMessage(cooldown.remainingMs),
        });
        return;
      }

      if (error.code === 'BOT_REP') {
        await context.reply({
          content: createCannotRepBotMessage(),
        });
        return;
      }

      if (error.code === 'SELF_REP') {
        await context.reply({
          content: createCannotRepSelfMessage(),
        });
        return;
      }

      if (error.code === 'GUILD_ONLY') {
        await context.reply({
          content: createGuildOnlyRepMessage(),
        });
        return;
      }

      await context.reply({
        content: error.message,
      });
      return;
    }

    console.error('Failed to give reputation:', error);

    await context.reply({
      content: 'Something went wrong while giving reputation. Please try again later.',
    });
  }
}
