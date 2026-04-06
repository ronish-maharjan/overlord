import { EmbedBuilder, GuildMember } from 'discord.js';
import { createBaseEmbed } from './baseEmbed';
import type { LevelProfile } from '../../types/levels';

export function createLevelProfileEmbed(params: {
  member: GuildMember;
  profile: LevelProfile;
}): EmbedBuilder {
  const { member, profile } = params;

  return createBaseEmbed()
    .setTitle(`Level ${profile.level}`)
    .setAuthor({
      name: member.displayName,
      iconURL: member.displayAvatarURL(),
    })
    .addFields(
      {
        name: 'XP',
        value: `${profile.xp}`,
        inline: true,
      },
      {
        name: 'Progress',
        value: `${profile.progressXp}/${profile.requiredXp}`,
        inline: true,
      },
      {
        name: 'Rank',
        value: `${profile.rank ?? 'Unranked'}`,
        inline: true,
      },
    );
}

export function createLevelRolesEmbed(params: {
  guildName: string;
  entries: Array<{ level: number; roleText: string }>;
}): EmbedBuilder {
  const { guildName, entries } = params;

  const description =
    entries.length === 0
      ? 'No level reward roles have been configured yet.'
      : entries.map((entry) => `**Level ${entry.level}** — ${entry.roleText}`).join('\n');

  return createBaseEmbed()
    .setTitle(`${guildName} Level Roles`)
    .setDescription(description);
}

export function createLevelLeaderboardEmbed(params: {
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
    .setTitle('XP Leaderboard')
    .setDescription(
      [
        '```',
        ...lines,
        '```',
        '',
        `Use **${prefix}xp** to view your level, and **${prefix}leaderboard** to see the server rankings.`,
        '',
        `**Showing entries ${start}–${end} out of ${totalUsers}**`,
      ].join('\n'),
    );
}

export function createEmptyLevelLeaderboardEmbed(prefix: string): EmbedBuilder {
  return createBaseEmbed()
    .setTitle('XP Leaderboard')
    .setDescription(
      [
        'No level data has been recorded in this server yet.',
        '',
        `Use ${prefix}xp to view your level, and ${prefix}leaderboard to see the server rankings.`,
      ].join('\n'),
    );
}
