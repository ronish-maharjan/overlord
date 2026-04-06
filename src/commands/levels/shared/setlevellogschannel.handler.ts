import type { GuildTextBasedChannel } from 'discord.js';
import { container } from '../../../container';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleSetLevelLogsChannel(params: {
  context: CommandContext;
  channel: GuildTextBasedChannel;
}): Promise<void> {
  const { context, channel } = params;

  try {
    await container.levelsService.setLevelLogsChannel({
      guildId: context.guildId,
      channelId: channel.id,
    });

    await context.reply({
      content: `Set the level logs channel to ${channel}.`,
    });
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to set level logs channel:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while setting the level logs channel.')],
    });
  }
}
