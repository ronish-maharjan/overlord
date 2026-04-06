import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  index,
  serial,
} from 'drizzle-orm/pg-core';

export const repStats = pgTable(
  'rep_stats',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    guildId: varchar('guild_id', { length: 32 }).notNull(),
    userId: varchar('user_id', { length: 32 }).notNull(),

    repsReceived: integer('reps_received').notNull().default(0),
    repsGiven: integer('reps_given').notNull().default(0),

    lastRepGivenAt: timestamp('last_rep_given_at', {
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
    guildUserUnique: uniqueIndex('rep_stats_guild_user_unique').on(
      table.guildId,
      table.userId,
    ),
    guildLeaderboardIdx: index('rep_stats_guild_leaderboard_idx').on(
      table.guildId,
      table.repsReceived,
    ),
    guildUserIdx: index('rep_stats_guild_user_idx').on(table.guildId, table.userId),
  }),
);

export const repTransactions = pgTable(
  'rep_transactions',
  {
    id: serial('id').primaryKey(),

    guildId: varchar('guild_id', { length: 32 }).notNull(),
    giverUserId: varchar('giver_user_id', { length: 32 }).notNull(),
    receiverUserId: varchar('receiver_user_id', { length: 32 }).notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    guildGiverIdx: index('rep_transactions_guild_giver_idx').on(
      table.guildId,
      table.giverUserId,
    ),
    guildReceiverIdx: index('rep_transactions_guild_receiver_idx').on(
      table.guildId,
      table.receiverUserId,
    ),
    guildCreatedIdx: index('rep_transactions_guild_created_idx').on(
      table.guildId,
      table.createdAt,
    ),
  }),
);
