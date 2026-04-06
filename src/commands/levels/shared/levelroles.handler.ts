import { container } from '../../../container';
import { LEVEL_ROLE_MILESTONES } from '../../../utils/levels/levelMilestones';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { createLevelRolesEmbed } from '../../../utils/embeds/levelEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleLevelRoles(params: {
  context: CommandContext;
}): Promise<void> {
  const { context } = params;

  if (!context.guildId || !context.source.guild) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used inside a server.')],
    });
    return;
  }

  try {
    const rewards = await container.levelsService.getLevelRoleRewards(context.guildId);

    const rewardMap = new Map(rewards.map((reward) => [reward.level, reward.roleId]));

    const entries = LEVEL_ROLE_MILESTONES.map((level) => {
      const roleId = rewardMap.get(level);
      return {
        level,
        roleText: roleId ? `<@&${roleId}>` : '*Not configured*',
      };
    });

    await context.reply({
      embeds: [
        createLevelRolesEmbed({
          guildName: context.source.guild.name,
          entries,
        }),
      ],
    });
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to load level roles:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while loading level roles.')],
    });
  }
}
