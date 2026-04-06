import type { GuildMember } from 'discord.js';
import { container } from '../container';
import { logger } from '../utils/logger/logger';

export async function syncMemberLevelRoles(member: GuildMember): Promise<void> {
  const profile = await container.levelsService.getLevelProfile({
    guildId: member.guild.id,
    userId: member.id,
  });

  const currentRoleIds = member.roles.cache.map((role) => role.id);

  const syncPlan = await container.levelsService.getRoleSyncPlan({
    guildId: member.guild.id,
    currentLevel: profile.level,
    currentRoleIds,
  });

  if (syncPlan.addedRoleIds.length === 0) {
    return;
  }

  const rolesToAdd = syncPlan.addedRoleIds
    .map((roleId) => member.guild.roles.cache.get(roleId))
    .filter((role): role is NonNullable<typeof role> => Boolean(role));

  if (rolesToAdd.length === 0) {
    logger.warn('No valid reward roles found to add during level sync', {
      guildId: member.guild.id,
      userId: member.id,
      requestedRoleIds: syncPlan.addedRoleIds,
    });
    return;
  }

  try {
    await member.roles.add(rolesToAdd, 'Level role sync');
  } catch (error) {
    logger.error('Failed to add level reward roles', {
      guildId: member.guild.id,
      userId: member.id,
      roleIds: rolesToAdd.map((role) => role.id),
      error,
    });
    throw error;
  }
}

export async function strictSyncMemberLevelRoles(member: GuildMember): Promise<void> {
  const profile = await container.levelsService.getLevelProfile({
    guildId: member.guild.id,
    userId: member.id,
  });

  const currentRoleIds = member.roles.cache.map((role) => role.id);

  const syncPlan = await container.levelsService.getStrictRoleSyncPlan({
    guildId: member.guild.id,
    targetLevel: profile.level,
    currentRoleIds,
  });

  const rolesToAdd = syncPlan.addedRoleIds
    .map((roleId) => member.guild.roles.cache.get(roleId))
    .filter((role): role is NonNullable<typeof role> => Boolean(role));

  const rolesToRemove = syncPlan.removedRoleIds
    .map((roleId) => member.guild.roles.cache.get(roleId))
    .filter((role): role is NonNullable<typeof role> => Boolean(role));

  try {
    if (rolesToAdd.length > 0) {
      await member.roles.add(rolesToAdd, 'Strict level role sync');
    }

    if (rolesToRemove.length > 0) {
      await member.roles.remove(rolesToRemove, 'Strict level role sync');
    }
  } catch (error) {
    logger.error('Failed to strictly sync level reward roles', {
      guildId: member.guild.id,
      userId: member.id,
      addRoleIds: rolesToAdd.map((role) => role.id),
      removeRoleIds: rolesToRemove.map((role) => role.id),
      error,
    });
    throw error;
  }
}
