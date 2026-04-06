import { EmbedBuilder, GuildMember } from 'discord.js';
import { createBaseEmbed } from './baseEmbed';
import type { RepCooldownStatus, RepProfile } from '../../types/rep';

export function createRepProfileEmbed(params: {
  member: GuildMember;
  profile: RepProfile;
  cooldownStatus?: RepCooldownStatus;
}): EmbedBuilder {
  const { member, profile} = params;

  const embed = createBaseEmbed()
    .setAuthor({
      name: member.displayName,
      iconURL: member.displayAvatarURL(),
    })
    .addFields(
      {
        name: 'Reputation',
        value: `${profile.repsReceived}`,
        inline: true,
      },
      {
        name: 'Rank',
        value: `${profile.rank ?? 'Unranked'}`,
        inline: true,
      },
    );

  return embed;
}

export function createRepLeaderboardEmbed(params: {
  lines: string[];
  page: number;
  totalUsers: number;
  pageSize: number;
  prefix: string;
}): EmbedBuilder {
  const { lines, page, totalUsers, pageSize, prefix } = params;

  const start = totalUsers === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalUsers);

  return createBaseEmbed()
    .setTitle('Reputation Leaderboard')
    .setDescription(
      [
        '```',
        ...lines,
        '```',
        '',
        `Use **${prefix}rep** to view your reputation, and **${prefix}giverep** to give rep to others.`,
        '',
        `**Showing entries ${start}–${end} out of ${totalUsers}**`,
      ].join('\n'),
    );
}

export function createEmptyLeaderboardEmbed(prefix: string): EmbedBuilder {
  return createBaseEmbed()
    .setTitle('Reputation Leaderboard')
    .setDescription(
      [
        'No reputation has been given in this server yet.',
        '',
        `Use ${prefix}rep to view your reputation, and ${prefix}giverep to give rep to others.`,
      ].join('\n'),
    );
}
