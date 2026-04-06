import type { ButtonInteraction } from 'discord.js';
import { CommandContext } from '../discord/commandContext';

export function formatLevelLeaderboardLine(
  rank: number,
  xp: number,
  level: number,
  username: string,
): string {
  const rankText = `${rank}.`.padEnd(6, ' ');
  return `${rankText}${xp} XP (Lv ${level}) - ${username}`;
}

export async function resolveLevelLeaderboardUsernameFromContext(
  context: CommandContext,
  userId: string,
): Promise<string> {
  const guild = context.source.guild;
  if (!guild) return 'Unknown User';

  try {
    const member = await guild.members.fetch(userId);
    return member.user.tag;
  } catch {
    try {
      const user = await context.source.client.users.fetch(userId);
      return user.tag;
    } catch {
      return 'Unknown User';
    }
  }
}

export async function resolveLevelLeaderboardUsernameFromInteraction(
  interaction: ButtonInteraction,
  userId: string,
): Promise<string> {
  if (!interaction.guild) return 'Unknown User';

  try {
    const member = await interaction.guild.members.fetch(userId);
    return member.user.tag;
  } catch {
    try {
      const user = await interaction.client.users.fetch(userId);
      return user.tag;
    } catch {
      return 'Unknown User';
    }
  }
}
