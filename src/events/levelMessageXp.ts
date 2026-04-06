import type { Message } from 'discord.js';
import { container } from '../container';
import { env } from '../config/env';
import { sendLevelLog } from './levelLogs';
import { syncMemberLevelRoles } from './levelRoleSync';
import { LevelsServiceError } from '../services/levels/levels.service';
import { getRandomXpGain } from '../services/levels/levels.xp';

export async function handleLevelMessageXp(message: Message): Promise<void> {
  if (!message.guild) return;
  if (message.author.bot) return;

  const content = message.content.trim();

  if (!content.length) return;

  if (content.startsWith(env.PREFIX)) return;

  const xpToAdd = getRandomXpGain();

  try {
    const result = await container.levelsService.awardXp({
      guildId: message.guild.id,
      userId: message.author.id,
      xpToAdd,
    });

    if (result.skippedDueToCooldown) {
      return;
    }

    if (!result.leveledUp) {
      return;
    }

    const member = await message.guild.members
      .fetch(message.author.id)
      .catch(() => null);

    if (!member) return;

    await syncMemberLevelRoles(member);

    await sendLevelLog({
      guild: message.guild,
      user: message.author,
      level: result.newLevel,
    });
  } catch (error) {
    if (error instanceof LevelsServiceError) {
      return;
    }

    throw error;
  }
}
