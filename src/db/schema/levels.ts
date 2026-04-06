import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const levelStats = pgTable(
  'level_stats',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guildId: varchar('guild_id', { length: 32 }).notNull(),
    userId: varchar('user_id', { length: 32 }).notNull(),

    xp: integer('xp').notNull().default(0),
    level: integer('level').notNull().default(0),
    messageCount: integer('message_count').notNull().default(0),

    lastXpGainedAt: timestamp('last_xp_gained_at', {
      withTimezone: true,
      mode: 'date',
    }),

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
  },
  (table) => ({
    guildUserUnique: uniqueIndex('level_stats_guild_user_unique').on(
      table.guildId,
      table.userId,
    ),
    guildXpIdx: index('level_stats_guild_xp_idx').on(table.guildId, table.xp),
    guildLevelIdx: index('level_stats_guild_level_idx').on(
      table.guildId,
      table.level,
    ),
    guildUserIdx: index('level_stats_guild_user_idx').on(
      table.guildId,
      table.userId,
    ),
  }),
);
