import { container } from '../../../container';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleRemoveLevelRole(params: {
  context: CommandContext;
  level: number;
}): Promise<void> {
  const { context, level } = params;

  try {
    const removed = await container.levelsService.removeLevelRoleReward({
      guildId: context.guildId,
      level,
    });

    if (!removed) {
      await context.reply({
        embeds: [createErrorEmbed(`No reward role is configured for level ${level}.`)],
      });
      return;
    }

    await context.reply({
      content: `Removed the reward role for **level ${level}**.`,
    });
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to remove level role:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while removing the level role.')],
    });
  }
}
