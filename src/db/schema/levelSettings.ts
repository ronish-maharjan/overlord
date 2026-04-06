import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const levelSettings = pgTable('level_settings', {
  guildId: varchar('guild_id', { length: 32 }).primaryKey(),

  levelLogsChannelId: varchar('level_logs_channel_id', { length: 32 }),

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
