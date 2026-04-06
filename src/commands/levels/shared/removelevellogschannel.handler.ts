import { container } from '../../../container';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleRemoveLevelLogsChannel(params: {
  context: CommandContext;
}): Promise<void> {
  const { context } = params;

  try {
    await container.levelsService.removeLevelLogsChannel({
      guildId: context.guildId,
    });

    await context.reply({
      content: 'Removed the level logs channel.',
    });
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to remove level logs channel:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while removing the level logs channel.')],
    });
  }
}
