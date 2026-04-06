import type { ButtonInteraction } from 'discord.js';
import { CommandContext } from '../discord/commandContext';

export function formatRepLeaderboardLine(
  rank: number,
  reps: number,
  username: string,
): string {
  const rankText = `${rank}.`.padEnd(6, ' ');
  return `${rankText}${reps} - ${username}`;
}

export async function resolveRepLeaderboardUsernameFromContext(
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

export async function resolveRepLeaderboardUsernameFromInteraction(
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
