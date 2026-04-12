import { pgTable, varchar, text, timestamp, bigint, unique } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const tags = pgTable('tags', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  guildId: varchar('guild_id', { length: 20 }).notNull(),
  tagName: varchar('tag_name', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  tagContent: text('tag_content').notNull(),
  ownerId: varchar('owner_id', { length: 20 }).notNull(),
  uses: bigint('uses', { mode: 'number' }).default(sql`0`).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniqueTag: unique().on(table.guildId, table.tagName),
}));
