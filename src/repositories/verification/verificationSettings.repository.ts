import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { verificationSettings } from '../../db/schema/verificationSettings';

export class VerificationSettingsRepository {
  async ensureGuildSettings(guildId: string) {
    await db
      .insert(verificationSettings)
      .values({
        guildId,
      })
      .onConflictDoNothing({
        target: [verificationSettings.guildId],
      });
  }

  async getGuildSettings(guildId: string) {
    const rows = await db
      .select()
      .from(verificationSettings)
      .where(eq(verificationSettings.guildId, guildId))
      .limit(1);

    return rows[0] ?? null;
  }

  async ensureAndGetGuildSettings(guildId: string) {
    await this.ensureGuildSettings(guildId);
    return this.getGuildSettings(guildId);
  }

  async setVerifiedRole(params: {
    guildId: string;
    roleId: string;
    now: Date;
  }) {
    const [row] = await db
      .insert(verificationSettings)
      .values({
        guildId: params.guildId,
        verifiedRoleId: params.roleId,
        createdAt: params.now,
        updatedAt: params.now,
      })
      .onConflictDoUpdate({
        target: [verificationSettings.guildId],
        set: {
          verifiedRoleId: params.roleId,
          updatedAt: params.now,
        },
      })
      .returning();

    return row;
  }

  async removeVerifiedRole(guildId: string, now: Date) {
    await this.ensureGuildSettings(guildId);

    const [row] = await db
      .update(verificationSettings)
      .set({
        verifiedRoleId: null,
        updatedAt: now,
      })
      .where(eq(verificationSettings.guildId, guildId))
      .returning();

    return row;
  }

  async setVerifyChannel(params: {
    guildId: string;
    channelId: string;
    now: Date;
  }) {
    const [row] = await db
      .insert(verificationSettings)
      .values({
        guildId: params.guildId,
        verifyChannelId: params.channelId,
        createdAt: params.now,
        updatedAt: params.now,
      })
      .onConflictDoUpdate({
        target: [verificationSettings.guildId],
        set: {
          verifyChannelId: params.channelId,
          updatedAt: params.now,
        },
      })
      .returning();

    return row;
  }

  async removeVerifyChannel(guildId: string, now: Date) {
    await this.ensureGuildSettings(guildId);

    const [row] = await db
      .update(verificationSettings)
      .set({
        verifyChannelId: null,
        verifyMessageId: null,
        updatedAt: now,
      })
      .where(eq(verificationSettings.guildId, guildId))
      .returning();

    return row;
  }

  async setVerifyMessage(params: {
    guildId: string;
    messageId: string | null;
    now: Date;
  }) {
    await this.ensureGuildSettings(params.guildId);

    const [row] = await db
      .update(verificationSettings)
      .set({
        verifyMessageId: params.messageId,
        updatedAt: params.now,
      })
      .where(eq(verificationSettings.guildId, params.guildId))
      .returning();

    return row;
  }
}
