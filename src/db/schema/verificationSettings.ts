import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const verificationSettings = pgTable('verification_settings', {
  guildId: varchar('guild_id', { length: 32 }).primaryKey(),

  verifiedRoleId: varchar('verified_role_id', { length: 32 }),
  verifyChannelId: varchar('verify_channel_id', { length: 32 }),
  verifyMessageId: varchar('verify_message_id', { length: 32 }),

  createdAt: timestamp('created_at', {
    withTimezone: true,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
    mode: 'date',
  })
    .notNull()
    .defaultNow(),
});
