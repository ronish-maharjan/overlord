import { and, count, desc, eq, gt, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import { levelStats } from '../../db/schema/levels';
import type { LevelLeaderboardEntry } from '../../types/levels';

export class LevelsRepository {
  async ensureUserStats(guildId: string, userId: string) {
    await db
      .insert(levelStats)
      .values({
        guildId,
        userId,
      })
      .onConflictDoNothing({
        target: [levelStats.guildId, levelStats.userId],
      });
  }

  async getUserStats(guildId: string, userId: string) {
    const rows = await db
      .select()
      .from(levelStats)
      .where(and(eq(levelStats.guildId, guildId), eq(levelStats.userId, userId)))
      .limit(1);

    return rows[0] ?? null;
  }

  async ensureAndGetUserStats(guildId: string, userId: string) {
    await this.ensureUserStats(guildId, userId);
    return this.getUserStats(guildId, userId);
  }

  async addXp(params: {
    guildId: string;
    userId: string;
    xpToAdd: number;
    messageCountToAdd?: number;
    now: Date;
  }) {
    const { guildId, userId, xpToAdd, messageCountToAdd = 1, now } = params;

    await this.ensureUserStats(guildId, userId);

    const [row] = await db
      .update(levelStats)
      .set({
        xp: sql`${levelStats.xp} + ${xpToAdd}`,
        messageCount: sql`${levelStats.messageCount} + ${messageCountToAdd}`,
        lastXpGainedAt: now,
        updatedAt: now,
      })
      .where(and(eq(levelStats.guildId, guildId), eq(levelStats.userId, userId)))
      .returning();

    return row;
  }

  async setXpAndLevel(params: {
    guildId: string;
    userId: string;
    xp: number;
    level: number;
    now: Date;
  }) {
    const { guildId, userId, xp, level, now } = params;

    await this.ensureUserStats(guildId, userId);

    const [row] = await db
      .update(levelStats)
      .set({
        xp,
        level,
        updatedAt: now,
      })
      .where(and(eq(levelStats.guildId, guildId), eq(levelStats.userId, userId)))
      .returning();

    return row;
  }

  async updateLevel(params: {
    guildId: string;
    userId: string;
    level: number;
    now: Date;
  }) {
    const { guildId, userId, level, now } = params;

    await this.ensureUserStats(guildId, userId);

    const [row] = await db
      .update(levelStats)
      .set({
        level,
        updatedAt: now,
      })
      .where(and(eq(levelStats.guildId, guildId), eq(levelStats.userId, userId)))
      .returning();

    return row;
  }

  async getUserRank(guildId: string, userId: string): Promise<number | null> {
    const userStats = await this.getUserStats(guildId, userId);
    if (!userStats) return null;

    const rows = await db
      .select({
        rank: count(),
      })
      .from(levelStats)
      .where(
        and(
          eq(levelStats.guildId, guildId),
          or(
            gt(levelStats.xp, userStats.xp),
            and(
              eq(levelStats.xp, userStats.xp),
              sql`${levelStats.userId} < ${userId}`,
            ),
          ),
        ),
      );

    const higherCount = Number(rows[0]?.rank ?? 0);
    return higherCount + 1;
  }

  async getLeaderboardPage(params: {
    guildId: string;
    page: number;
    pageSize: number;
  }): Promise<LevelLeaderboardEntry[]> {
    const offset = (params.page - 1) * params.pageSize;

    const rows = await db
      .select({
        userId: levelStats.userId,
        xp: levelStats.xp,
        level: levelStats.level,
      })
      .from(levelStats)
      .where(eq(levelStats.guildId, params.guildId))
      .orderBy(desc(levelStats.xp), levelStats.userId)
      .limit(params.pageSize)
      .offset(offset);

    return rows.map((row, index) => ({
      userId: row.userId,
      xp: row.xp,
      level: row.level,
      rank: offset + index + 1,
    }));
  }

  async countLeaderboardUsers(guildId: string): Promise<number> {
    const rows = await db
      .select({
        count: count(),
      })
      .from(levelStats)
      .where(eq(levelStats.guildId, guildId));

    return Number(rows[0]?.count ?? 0);
  }
}
