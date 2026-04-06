import type { Guild, User, TextChannel, ThreadChannel, NewsChannel } from 'discord.js';
import { container } from '../container';

type SendableGuildChannel = TextChannel | ThreadChannel | NewsChannel;

function isSendableGuildChannel(channel: unknown): channel is SendableGuildChannel {
  return Boolean(channel) && typeof (channel as SendableGuildChannel).send === 'function';
}

export async function sendLevelLog(params: {
  guild: Guild;
  user: User;
  level: number;
}): Promise<void> {
  const { guild, user, level } = params;

  const settings = await container.levelsService.getLevelSettings(guild.id);

  if (!settings.levelLogsChannelId) {
    return;
  }

  const channel = await guild.channels.fetch(settings.levelLogsChannelId).catch(() => null);

  if (!channel || !isSendableGuildChannel(channel)) {
    return;
  }

  await channel.send(`${user} reached level **${level}**.`);
}
