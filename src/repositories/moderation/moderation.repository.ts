import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { moderationActions } from '../../db/schema/moderation';
import type {
  CreateModerationActionInput,
  ModerationActionRecord,
} from '../../types/moderation';

export class ModerationRepository {
  async createAction(input: CreateModerationActionInput) {
    const [row] = await db
      .insert(moderationActions)
      .values({
        guildId: input.guildId,
        targetUserId: input.targetUserId,
        moderatorUserId: input.moderatorUserId,
        actionType: input.actionType,
        reason: input.reason,
        createdAt: input.createdAt ?? new Date(),
        expiresAt: input.expiresAt ?? null,
        resolved: input.resolved ?? true,
        channelId: input.channelId ?? null,
        messageId: input.messageId ?? null,
      })
      .returning();

    return this.mapRow(row);
  }

  async getCaseById(guildId: string, caseId: number): Promise<ModerationActionRecord | null> {
    const rows = await db
      .select()
      .from(moderationActions)
      .where(
        and(
          eq(moderationActions.guildId, guildId),
          eq(moderationActions.id, caseId),
        ),
      )
      .limit(1);

    return rows[0] ? this.mapRow(rows[0]) : null;
  }

  async getHistoryPage(params: {
    guildId: string;
    targetUserId: string;
    page: number;
    pageSize: number;
  }): Promise<ModerationActionRecord[]> {
    const offset = (params.page - 1) * params.pageSize;

    const rows = await db
      .select()
      .from(moderationActions)
      .where(
        and(
          eq(moderationActions.guildId, params.guildId),
          eq(moderationActions.targetUserId, params.targetUserId),
        ),
      )
      .orderBy(desc(moderationActions.createdAt))
      .limit(params.pageSize)
      .offset(offset);

    return rows.map((row) => this.mapRow(row));
  }

  async countHistoryEntries(guildId: string, targetUserId: string): Promise<number> {
    const rows = await db
      .select({
        count: count(),
      })
      .from(moderationActions)
      .where(
        and(
          eq(moderationActions.guildId, guildId),
          eq(moderationActions.targetUserId, targetUserId),
        ),
      );

    return Number(rows[0]?.count ?? 0);
  }

  private mapRow(row: typeof moderationActions.$inferSelect): ModerationActionRecord {
    return {
      id: row.id,
      guildId: row.guildId,
      targetUserId: row.targetUserId,
      moderatorUserId: row.moderatorUserId,
      actionType: row.actionType as ModerationActionRecord['actionType'],
      reason: row.reason,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt ?? null,
      resolved: row.resolved,
      channelId: row.channelId ?? null,
      messageId: row.messageId ?? null,
    };
  }
}
