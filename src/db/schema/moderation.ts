import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const moderationActions = pgTable(
  'moderation_actions',
  {
    id: serial('id').primaryKey(),

    guildId: varchar('guild_id', { length: 32 }).notNull(),

    targetUserId: varchar('target_user_id', { length: 32 }).notNull(),
    moderatorUserId: varchar('moderator_user_id', { length: 32 }).notNull(),

    actionType: varchar('action_type', { length: 32 }).notNull(),
    reason: text('reason').notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),

    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }),

    resolved: boolean('resolved').notNull().default(true),

    channelId: varchar('channel_id', { length: 32 }),
    messageId: varchar('message_id', { length: 32 }),
  },
  (table) => ({
    guildTargetIdx: index('moderation_actions_guild_target_idx').on(
      table.guildId,
      table.targetUserId,
    ),
    guildCreatedIdx: index('moderation_actions_guild_created_idx').on(
      table.guildId,
      table.createdAt,
    ),
    guildTypeIdx: index('moderation_actions_guild_type_idx').on(
      table.guildId,
      table.actionType,
    ),
  }),
);
