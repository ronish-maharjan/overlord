import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { moderationSettings } from '../../db/schema/moderationSettings';

export class ModerationSettingsRepository {
  async ensureGuildSettings(guildId: string) {
    await db
      .insert(moderationSettings)
      .values({
        guildId,
      })
      .onConflictDoNothing({
        target: [moderationSettings.guildId],
      });
  }

  async getGuildSettings(guildId: string) {
    const rows = await db
      .select()
      .from(moderationSettings)
      .where(eq(moderationSettings.guildId, guildId))
      .limit(1);

    return rows[0] ?? null;
  }

  async ensureAndGetGuildSettings(guildId: string) {
    await this.ensureGuildSettings(guildId);
    return this.getGuildSettings(guildId);
  }

  async setModLogsChannel(params: {
    guildId: string;
    channelId: string;
    now: Date;
  }) {
    const [row] = await db
      .insert(moderationSettings)
      .values({
        guildId: params.guildId,
        modLogsChannelId: params.channelId,
        createdAt: params.now,
        updatedAt: params.now,
      })
      .onConflictDoUpdate({
        target: [moderationSettings.guildId],
        set: {
          modLogsChannelId: params.channelId,
          updatedAt: params.now,
        },
      })
      .returning();

    return row;
  }

  async removeModLogsChannel(guildId: string, now: Date) {
    await this.ensureGuildSettings(guildId);

    const [row] = await db
      .update(moderationSettings)
      .set({
        modLogsChannelId: null,
        updatedAt: now,
      })
      .where(eq(moderationSettings.guildId, guildId))
      .returning();

    return row;
  }
}
