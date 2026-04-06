import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { levelSettings } from '../../db/schema/levelSettings';

export class LevelSettingsRepository {
  async ensureGuildSettings(guildId: string) {
    await db
      .insert(levelSettings)
      .values({
        guildId,
      })
      .onConflictDoNothing({
        target: [levelSettings.guildId],
      });
  }

  async getGuildSettings(guildId: string) {
    const rows = await db
      .select()
      .from(levelSettings)
      .where(eq(levelSettings.guildId, guildId))
      .limit(1);

    return rows[0] ?? null;
  }

  async ensureAndGetGuildSettings(guildId: string) {
    await this.ensureGuildSettings(guildId);
    return this.getGuildSettings(guildId);
  }

  async setLevelLogsChannel(params: {
    guildId: string;
    channelId: string;
    now: Date;
  }) {
    const { guildId, channelId, now } = params;

    const [row] = await db
      .insert(levelSettings)
      .values({
        guildId,
        levelLogsChannelId: channelId,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [levelSettings.guildId],
        set: {
          levelLogsChannelId: channelId,
          updatedAt: now,
        },
      })
      .returning();

    return row;
  }

  async removeLevelLogsChannel(guildId: string, now: Date) {
    await this.ensureGuildSettings(guildId);

    const [row] = await db
      .update(levelSettings)
      .set({
        levelLogsChannelId: null,
        updatedAt: now,
      })
      .where(eq(levelSettings.guildId, guildId))
      .returning();

    return row;
  }
}
