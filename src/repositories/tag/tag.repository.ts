import { eq, and, sql } from 'drizzle-orm';
import { db } from '../../db';
import { tags } from '../../db/schema/tag';

export interface Tag {
  id: number;
  guildId: string;
  tagName: string;
  displayName: string;
  tagContent: string;
  ownerId: string;
  uses: number;
  createdAt: Date;
  updatedAt: Date;
}

export class TagRepository {
  async findByNameAndGuild(guildId: string, tagName: string): Promise<Tag | null> {
    const result = await db
      .select()
      .from(tags)
      .where(and(eq(tags.guildId, guildId), eq(tags.tagName, tagName)))
      .limit(1);

    return result[0] || null;
  }

  async create(data: {
    guildId: string;
    tagName: string;
    displayName: string;
    tagContent: string;
    ownerId: string;
  }): Promise<void> {
    await db.insert(tags).values({
      guildId: data.guildId,
      tagName: data.tagName,
      displayName: data.displayName,
      tagContent: data.tagContent,
      ownerId: data.ownerId,
    });
  }

  async update(
    guildId: string,
    tagName: string,
    data: { tagContent: string }
  ): Promise<void> {
    await db
      .update(tags)
      .set({
        tagContent: data.tagContent,
        updatedAt: new Date(),
      })
      .where(and(eq(tags.guildId, guildId), eq(tags.tagName, tagName)));
  }

  async delete(guildId: string, tagName: string): Promise<void> {
    await db
      .delete(tags)
      .where(and(eq(tags.guildId, guildId), eq(tags.tagName, tagName)));
  }

  async findAllByGuild(guildId: string): Promise<Tag[]> {
    return await db.select().from(tags).where(eq(tags.guildId, guildId));
  }

  async exists(guildId: string, tagName: string): Promise<boolean> {
    const tag = await this.findByNameAndGuild(guildId, tagName);
    return tag !== null;
  }

  async incrementUses(guildId: string, tagName: string): Promise<void> {
    await db
      .update(tags)
      .set({
        uses: sql`${tags.uses} + 1`,
      })
      .where(and(eq(tags.guildId, guildId), eq(tags.tagName, tagName)));
  }
}
