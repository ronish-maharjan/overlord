import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { levelRoleRewards } from '../../db/schema/levelRoleRewards';

export class LevelRoleRewardsRepository {
  async setLevelRoleReward(params: {
    guildId: string;
    level: number;
    roleId: string;
    now: Date;
  }) {
    const { guildId, level, roleId, now } = params;

    const [row] = await db
      .insert(levelRoleRewards)
      .values({
        guildId,
        level,
        roleId,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [levelRoleRewards.guildId, levelRoleRewards.level],
        set: {
          roleId,
          updatedAt: now,
        },
      })
      .returning();

    return row;
  }

  async removeLevelRoleReward(guildId: string, level: number) {
    const rows = await db
      .delete(levelRoleRewards)
      .where(
        and(
          eq(levelRoleRewards.guildId, guildId),
          eq(levelRoleRewards.level, level),
        ),
      )
      .returning();

    return rows[0] ?? null;
  }

  async getLevelRoleReward(guildId: string, level: number) {
    const rows = await db
      .select()
      .from(levelRoleRewards)
      .where(
        and(
          eq(levelRoleRewards.guildId, guildId),
          eq(levelRoleRewards.level, level),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  async getGuildLevelRoleRewards(guildId: string) {
    return db
      .select()
      .from(levelRoleRewards)
      .where(eq(levelRoleRewards.guildId, guildId))
      .orderBy(asc(levelRoleRewards.level));
  }

  async getRewardsUpToLevel(guildId: string, level: number) {
    const rewards = await this.getGuildLevelRoleRewards(guildId);
    return rewards.filter((reward) => reward.level <= level);
  }
}
