import { and, count, desc, eq, gt, or, sql } from 'drizzle-orm';
import { db } from '../../db';
import { repStats, repTransactions } from '../../db/schema/rep';
import type { RepLeaderboardEntry } from '../../types/rep';

export class RepRepository {
    async ensureUserStats(guildId: string, userId: string) {
        await db
        .insert(repStats)
        .values({
            guildId,
            userId,
        })
        .onConflictDoNothing({
            target: [repStats.guildId, repStats.userId],
        });
    }

    async getUserStats(guildId: string, userId: string) {
        const rows = await db
        .select()
        .from(repStats)
        .where(and(eq(repStats.guildId, guildId), eq(repStats.userId, userId)))
        .limit(1);

        return rows[0] ?? null;
    }

    async ensureAndGetUserStats(guildId: string, userId: string) {
        await this.ensureUserStats(guildId, userId);
        return this.getUserStats(guildId, userId);
    }

    async createRepTransaction(params: {
        guildId: string;
        giverUserId: string;
        receiverUserId: string;
    }) {
        const [row] = await db
        .insert(repTransactions)
        .values({
            guildId: params.guildId,
            giverUserId: params.giverUserId,
            receiverUserId: params.receiverUserId,
        })
        .returning();

        return row;
    }

    async incrementRepGiven(guildId: string, userId: string, givenAt: Date) {
        await this.ensureUserStats(guildId, userId);

        const [row] = await db
        .update(repStats)
        .set({
            repsGiven: sql`${repStats.repsGiven} + 1`,
            lastRepGivenAt: givenAt,
            updatedAt: givenAt,
        })
        .where(and(eq(repStats.guildId, guildId), eq(repStats.userId, userId)))
        .returning();

        return row;
    }

    async incrementRepReceived(guildId: string, userId: string, updatedAt: Date) {
        await this.ensureUserStats(guildId, userId);

        const [row] = await db
        .update(repStats)
        .set({
            repsReceived: sql`${repStats.repsReceived} + 1`,
            updatedAt,
        })
        .where(and(eq(repStats.guildId, guildId), eq(repStats.userId, userId)))
        .returning();

        return row;
    }

    async giveRep(params: {
        guildId: string;
        giverUserId: string;
        receiverUserId: string;
        now: Date;
    }) {
        const { guildId, giverUserId, receiverUserId, now } = params;

        return db.transaction(async (tx) => {
            await tx
            .insert(repStats)
            .values([
                { guildId, userId: giverUserId },
                { guildId, userId: receiverUserId },
            ])
            .onConflictDoNothing({
                target: [repStats.guildId, repStats.userId],
            });

            await tx.insert(repTransactions).values({
                guildId,
                giverUserId,
                receiverUserId,
                createdAt: now,
            });

            const [giverRow] = await tx
            .update(repStats)
            .set({
                repsGiven: sql`${repStats.repsGiven} + 1`,
                lastRepGivenAt: now,
                updatedAt: now,
            })
            .where(and(eq(repStats.guildId, guildId), eq(repStats.userId, giverUserId)))
            .returning();

            const [receiverRow] = await tx
            .update(repStats)
            .set({
                repsReceived: sql`${repStats.repsReceived} + 1`,
                updatedAt: now,
            })
            .where(
                and(eq(repStats.guildId, guildId), eq(repStats.userId, receiverUserId)),
            )
            .returning();

            return {
                giverStats: giverRow,
                receiverStats: receiverRow,
            };
        });
    }

    async getUserRank(guildId: string, userId: string): Promise<number | null> {
        const userStats = await this.getUserStats(guildId, userId);
        if (!userStats) return null;

        const rows = await db
        .select({
            rank: count(),
        })
        .from(repStats)
        .where(
            and(
                eq(repStats.guildId, guildId),
                or(
                    gt(repStats.repsReceived, userStats.repsReceived),
                    and(
                        eq(repStats.repsReceived, userStats.repsReceived),
                        sql`${repStats.userId} < ${userId}`,
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
    }): Promise<RepLeaderboardEntry[]> {
        const offset = (params.page - 1) * params.pageSize;

        const rows = await db
        .select({
            userId: repStats.userId,
            repsReceived: repStats.repsReceived,
        })
        .from(repStats)
        .where(
            and(eq(repStats.guildId, params.guildId), gt(repStats.repsReceived, 0)),
        )
        .orderBy(desc(repStats.repsReceived), repStats.userId)
        .limit(params.pageSize)
        .offset(offset);

        return rows.map((row, index) => ({
            userId: row.userId,
            repsReceived: row.repsReceived,
            rank: offset + index + 1,
        }));
    }

    async countLeaderboardUsers(guildId: string): Promise<number> {
        const rows = await db
        .select({
            count: count(),
        })
        .from(repStats)
        .where(and(eq(repStats.guildId, guildId), gt(repStats.repsReceived, 0)));

        return Number(rows[0]?.count ?? 0);
    }

    async getGivenTransactionCount(guildId: string, userId: string): Promise<number> {
        const rows = await db
        .select({
            count: count(),
        })
        .from(repTransactions)
        .where(
            and(
                eq(repTransactions.guildId, guildId),
                eq(repTransactions.giverUserId, userId),
            ),
        );

        return Number(rows[0]?.count ?? 0);
    }

    async getReceivedTransactionCount(
        guildId: string,
        userId: string,
    ): Promise<number> {
        const rows = await db
        .select({
            count: count(),
        })
        .from(repTransactions)
        .where(
            and(
                eq(repTransactions.guildId, guildId),
                eq(repTransactions.receiverUserId, userId),
            ),
        );

        return Number(rows[0]?.count ?? 0);
    }
    async getLatestRepTransactionByGiver(
        guildId: string,
        giverUserId: string,
    ) {
        const rows = await db
        .select({
            receiverUserId: repTransactions.receiverUserId,
            createdAt: repTransactions.createdAt,
        })
        .from(repTransactions)
        .where(
            and(
                eq(repTransactions.guildId, guildId),
                eq(repTransactions.giverUserId, giverUserId),
            ),
        )
        .orderBy(desc(repTransactions.createdAt))
        .limit(1);

        return rows[0] ?? null;
    }
    async setRepReceived(guildId: string, userId: string, value: number, updatedAt: Date) {
        await this.ensureUserStats(guildId, userId);

        const [row] = await db
        .update(repStats)
        .set({
            repsReceived: value,
            updatedAt,
        })
        .where(and(eq(repStats.guildId, guildId), eq(repStats.userId, userId)))
        .returning();

        return row;
    }
}
