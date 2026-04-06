import type { GuildMember } from 'discord.js';
import { container } from '../../../container';
import { RepServiceError } from '../../../services/rep/rep.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleSetRep(params: {
  context: CommandContext;
  targetMember: GuildMember | null;
  value: number;
}): Promise<void> {
  const { context, targetMember, value } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used inside a server.')],
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
    await container.repService.setRep({
      guildId: context.guildId,
      targetUserId: targetMember.id,
      value,
    });

    await context.reply({
      content: `Set **${targetMember.user.username}**'s rep to **${value}**`,
    });
  } catch (error) {
    if (error instanceof RepServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to set rep:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while setting reputation.')],
    });
  }
}
