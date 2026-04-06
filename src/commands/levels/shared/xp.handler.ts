import type { GuildMember } from 'discord.js';
import { container } from '../../../container';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { createLevelProfileEmbed } from '../../../utils/embeds/levelEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleXpProfile(params: {
  context: CommandContext;
  targetMember: GuildMember;
}): Promise<void> {
  const { context, targetMember } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used inside a server.')],
    });
    return;
  }

  try {
    const profile = await container.levelsService.getLevelProfile({
      guildId: context.guildId,
      userId: targetMember.id,
    });

    await context.reply({
      embeds: [
        createLevelProfileEmbed({
          member: targetMember,
          profile,
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

    console.error('Failed to load XP profile:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while loading the XP profile.')],
    });
  }
}
