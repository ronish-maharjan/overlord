import type { TextChannel, NewsChannel, ThreadChannel } from 'discord.js';
import { container } from '../../../container';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

type PurgeableChannel = TextChannel | NewsChannel | ThreadChannel;

export async function handlePurgeContains(params: {
  context: CommandContext;
  amount: number;
  text: string;
}): Promise<void> {
  const { context, amount, text } = params;

  const channel = context.source.channel as PurgeableChannel;

  if (!text.trim().length) {
    await context.reply({
      embeds: [createErrorEmbed('You must provide text to search for.')],
      ephemeral: true,
    });
    return;
  }

  if (!('bulkDelete' in channel)) {
    await context.reply({
      embeds: [createErrorEmbed('This channel does not support purging.')],
      ephemeral: true,
    });
    return;
  }

  try {
    const result = await container.moderationPurgeService.purgeContains(
      channel,
      amount,
      text,
    );

    await context.reply({
      content: `Deleted **${result.deletedCount}** messages containing **${text}**.`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Something went wrong while purging messages.';

    await context.reply({
      embeds: [createErrorEmbed(message)],
      ephemeral: true,
    });
  }
}
