import type { GuildMember } from 'discord.js';
import { container } from '../../../container';
import { sendLevelLog } from '../../../events/levelLogs';
import { strictSyncMemberLevelRoles } from '../../../events/levelRoleSync';
import { LevelsServiceError } from '../../../services/levels/levels.service';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { CommandContext } from '../../../utils/discord/commandContext';

export async function handleSetLevel(params: {
  context: CommandContext;
  targetMember: GuildMember | null;
  level: number;
}): Promise<void> {
  const { context, targetMember, level } = params;

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
    const result = await container.levelsService.setLevel({
      guildId: context.guildId,
      userId: targetMember.id,
      level,
    });

    await strictSyncMemberLevelRoles(targetMember);

    if (result.newLevel > result.oldLevel) {
      await sendLevelLog({
        guild: targetMember.guild,
        user: targetMember.user,
        level: result.newLevel,
      });
    }

    await context.reply({
      content: `Set **${targetMember.user.username}**'s level to **${result.newLevel}**.`,
    });
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to set level:', error);

    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while setting the level.')],
    });
  }
}
