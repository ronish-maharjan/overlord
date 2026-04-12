import { TagRepository } from '../../repositories/tag/tag.repository';

export class TagServiceError extends Error {
  constructor(
    message: string,
    public code:
      | 'TAG_EXISTS'
      | 'TAG_NOT_FOUND'
      | 'NOT_OWNER'
      | 'INVALID_NAME'
      | 'INVALID_CONTENT'
      | 'DATABASE_ERROR',
  ) {
    super(message);
    this.name = 'TagServiceError';
  }
}

export class TagService {
  constructor(private tagRepository: TagRepository) {}

  async createTag(params: {
    guildId: string;
    tagName: string;
    tagContent: string;
    ownerId: string;
  }): Promise<void> {
    const { guildId, tagName, tagContent, ownerId } = params;

    // Validate tag name
    if (!tagName || tagName.length === 0) {
      throw new TagServiceError('Tag name cannot be empty', 'INVALID_NAME');
    }

    if (tagName.length > 100) {
      throw new TagServiceError('Tag name must be 100 characters or less', 'INVALID_NAME');
    }

    // REMOVED: Space validation
    // REMOVED: Special character validation

    // Validate content
    if (!tagContent || tagContent.length === 0) {
      throw new TagServiceError('Tag content cannot be empty', 'INVALID_CONTENT');
    }

    if (tagContent.length > 2000) {
      throw new TagServiceError('Tag content must be 2000 characters or less', 'INVALID_CONTENT');
    }

    try {
      const exists = await this.tagRepository.exists(guildId, tagName.toLowerCase());

      if (exists) {
        throw new TagServiceError(`Tag "${tagName}" already exists`, 'TAG_EXISTS');
      }

      await this.tagRepository.create({
        guildId,
        tagName: tagName.toLowerCase(),
        displayName: tagName,
        tagContent,
        ownerId,
      });
    } catch (error) {
      if (error instanceof TagServiceError) {
        throw error;
      }
      console.error('Database error creating tag:', error);
      throw new TagServiceError('Failed to create tag', 'DATABASE_ERROR');
    }
  }

  async getTag(params: { guildId: string; tagName: string }) {
    const { guildId, tagName } = params;

    try {
      const tag = await this.tagRepository.findByNameAndGuild(guildId, tagName.toLowerCase());

      if (!tag) {
        throw new TagServiceError(`Tag "${tagName}" not found`, 'TAG_NOT_FOUND');
      }

      return tag;
    } catch (error) {
      if (error instanceof TagServiceError) {
        throw error;
      }
      console.error('Database error getting tag:', error);
      throw new TagServiceError('Failed to get tag', 'DATABASE_ERROR');
    }
  }

  async updateTag(params: {
    guildId: string;
    tagName: string;
    newContent: string;
    userId: string;
    isAdmin?: boolean;
  }): Promise<void> {
    const { guildId, tagName, newContent, userId, isAdmin = false } = params;

    if (!newContent || newContent.length === 0) {
      throw new TagServiceError('Tag content cannot be empty', 'INVALID_CONTENT');
    }

    if (newContent.length > 2000) {
      throw new TagServiceError('Tag content must be 2000 characters or less', 'INVALID_CONTENT');
    }

    try {
      const tag = await this.getTag({ guildId, tagName });

      if (tag.ownerId !== userId && !isAdmin) {
        throw new TagServiceError('You do not own this tag', 'NOT_OWNER');
      }

      await this.tagRepository.update(guildId, tagName.toLowerCase(), {
        tagContent: newContent,
      });
    } catch (error) {
      if (error instanceof TagServiceError) {
        throw error;
      }
      console.error('Database error updating tag:', error);
      throw new TagServiceError('Failed to update tag', 'DATABASE_ERROR');
    }
  }

  async deleteTag(params: {
    guildId: string;
    tagName: string;
    userId: string;
    isAdmin?: boolean;
  }): Promise<void> {
    const { guildId, tagName, userId, isAdmin = false } = params;

    try {
      const tag = await this.getTag({ guildId, tagName });

      if (tag.ownerId !== userId && !isAdmin) {
        throw new TagServiceError('You do not own this tag', 'NOT_OWNER');
      }

      await this.tagRepository.delete(guildId, tagName.toLowerCase());
    } catch (error) {
      if (error instanceof TagServiceError) {
        throw error;
      }
      console.error('Database error deleting tag:', error);
      throw new TagServiceError('Failed to delete tag', 'DATABASE_ERROR');
    }
  }

  async listTags(params: { guildId: string }) {
    const { guildId } = params;

    try {
      return await this.tagRepository.findAllByGuild(guildId);
    } catch (error) {
      console.error('Database error listing tags:', error);
      throw new TagServiceError('Failed to list tags', 'DATABASE_ERROR');
    }
  }

  async incrementUses(params: { guildId: string; tagName: string }): Promise<void> {
    const { guildId, tagName } = params;

    try {
      await this.tagRepository.incrementUses(guildId, tagName.toLowerCase());
    } catch (error) {
      console.error('Database error incrementing tag uses:', error);
    }
  }
}
