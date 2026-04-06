import type { Guild, GuildMember, Message } from 'discord.js';

export async function resolveMemberFromMessage(
  message: Message,
  input?: string,
): Promise<GuildMember | null> {
  if (!message.guild || !input) return null;

  const mention = message.mentions.members?.first();
  if (mention) return mention;

  const cleaned = input.replace(/[<@!>]/g, '');

  try {
    return await message.guild.members.fetch(cleaned);
  } catch {
    return null;
  }
}

export async function resolveMemberFromGuild(
  guild: Guild,
  input: string,
): Promise<GuildMember | null> {
  const cleaned = input.replace(/[<@!>]/g, '');

  try {
    return await guild.members.fetch(cleaned);
  } catch {
    return null;
  }
}
