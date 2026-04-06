import type { Role } from 'discord.js';
import { container } from '../../../container';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleSetLevelRole(params: {
  context: CommandContext;
  level: number;
  role: Role;
}): Promise<void> {
  const { context, level, role } = params;

  try {
    await container.levelsService.setLevelRoleReward({
      guildId: context.guildId,
      level,
      roleId: role.id,
    });

    await context.reply({
      content: `Set the reward role for **level ${level}** to ${role}.`,
    });
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to set level role:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while setting the level role.')],
    });
  }
}
