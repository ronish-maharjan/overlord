import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const levelRoleRewards = pgTable(
  'level_role_rewards',
  {
    id: serial('id').primaryKey(),

    guildId: varchar('guild_id', { length: 32 }).notNull(),
    level: integer('level').notNull(),
    roleId: varchar('role_id', { length: 32 }).notNull(),

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
    guildLevelUnique: uniqueIndex('level_role_rewards_guild_level_unique').on(
      table.guildId,
      table.level,
    ),
    guildLevelIdx: index('level_role_rewards_guild_level_idx').on(
      table.guildId,
      table.level,
    ),
    guildRoleIdx: index('level_role_rewards_guild_role_idx').on(
      table.guildId,
      table.roleId,
    ),
  }),
);
