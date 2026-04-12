import { container } from '../../../container';
import { TagServiceError } from '../../../services/tag/tag.service';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';

export async function handleCreateTag(params: {
  context: CommandContext;
  tagName: string;
  tagContent: string;
}): Promise<void> {
  const { context, tagName, tagContent } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    // Process content: support both \n and code blocks
    let formattedContent = tagContent;
    
    // Remove code block markers if present (```content```)
    formattedContent = formattedContent.replace(/^```\n?/, '').replace(/```$/, '').trim();
    
    // Convert literal \n to actual newlines
    formattedContent = formattedContent.replace(/\\n/g, '\n');

    await container.tagService.createTag({
      guildId: context.guildId,
      tagName,
      tagContent: formattedContent,
      ownerId: context.user.id,
    });

    await context.reply({
      content: `**Success:** Tag \`${tagName}\` has been created!\n**Tip:** Use \`\\n\` for line breaks in your tag content.`,
    });
  } catch (error) {
    if (error instanceof TagServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to create tag:', error);
    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while creating the tag.')],
    });
  }
}

export async function handleViewTag(params: {
  context: CommandContext;
  tagName: string;
}): Promise<void> {
  const { context, tagName } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    const tag = await container.tagService.getTag({
      guildId: context.guildId,
      tagName,
    });

    // Increment usage counter (fire and forget)
    container.tagService
      .incrementUses({
        guildId: context.guildId,
        tagName,
      })
      .catch(console.error);

    // Auto-detect: If content has newlines, use embed, otherwise plain text
    const hasMultipleLines = tag.tagContent.includes('\n');

    if (hasMultipleLines) {
      const embed = {
        color: 0x5865f2,
        description: tag.tagContent,
      };
      await context.reply({ embeds: [embed] });
    } else {
      await context.reply({
        content: tag.tagContent,
      });
    }
  } catch (error) {
    if (error instanceof TagServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to view tag:', error);
    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while fetching the tag.')],
    });
  }
}

export async function handleEditTag(params: {
  context: CommandContext;
  tagName: string;
  newContent: string;
}): Promise<void> {
  const { context, tagName, newContent } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    const member = context.source.member;
    const isAdmin = member?.permissions.has('Administrator') || false;

    // Process content: support both \n and code blocks
    let formattedContent = newContent;
    
    // Remove code block markers if present
    formattedContent = formattedContent.replace(/^```\n?/, '').replace(/```$/, '').trim();
    
    // Convert literal \n to actual newlines
    formattedContent = formattedContent.replace(/\\n/g, '\n');

    await container.tagService.updateTag({
      guildId: context.guildId,
      tagName,
      newContent: formattedContent,
      userId: context.user.id,
      isAdmin,
    });

    await context.reply({
      content: `**Success:** Tag \`${tagName}\` has been updated!`,
    });
  } catch (error) {
    if (error instanceof TagServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to edit tag:', error);
    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while editing the tag.')],
    });
  }
}

export async function handleDeleteTag(params: {
  context: CommandContext;
  tagName: string;
}): Promise<void> {
  const { context, tagName } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    const member = context.source.member;
    const isAdmin = member?.permissions.has('Administrator') || false;

    await container.tagService.deleteTag({
      guildId: context.guildId,
      tagName,
      userId: context.user.id,
      isAdmin,
    });

    await context.reply({
      content: `**Success:** Tag \`${tagName}\` has been deleted!`,
    });
  } catch (error) {
    if (error instanceof TagServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to delete tag:', error);
    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while deleting the tag.')],
    });
  }
}

export async function handleTagInfo(params: {
  context: CommandContext;
  tagName: string;
}): Promise<void> {
  const { context, tagName } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    const tag = await container.tagService.getTag({
      guildId: context.guildId,
      tagName,
    });

    const embed = {
      color: 0x5865f2,
      title: `Tag Info: ${tag.displayName}`,
      fields: [
        {
          name: 'Owner',
          value: `<@${tag.ownerId}>`,
          inline: true,
        },
        {
          name: 'Uses',
          value: tag.uses.toString(),
          inline: true,
        },
        {
          name: 'Created',
          value: `<t:${Math.floor(new Date(tag.createdAt).getTime() / 1000)}:R>`,
          inline: true,
        },
        {
          name: 'Last Updated',
          value: `<t:${Math.floor(new Date(tag.updatedAt).getTime() / 1000)}:R>`,
          inline: true,
        },
        {
          name: 'Content',
          value:
            tag.tagContent.length > 1024
              ? tag.tagContent.substring(0, 1021) + '...'
              : tag.tagContent,
        },
      ],
      timestamp: new Date(),
    };

    await context.reply({ embeds: [embed] });
  } catch (error) {
    if (error instanceof TagServiceError) {
      await context.reply({
        embeds: [createErrorEmbed(error.message)],
      });
      return;
    }

    console.error('Failed to get tag info:', error);
    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while fetching tag info.')],
    });
  }
}

export async function handleListTags(params: { context: CommandContext }): Promise<void> {
  const { context } = params;

  if (!context.guildId) {
    await context.reply({
      embeds: [createErrorEmbed('This command can only be used in a server.')],
    });
    return;
  }

  try {
    const allTags = await container.tagService.listTags({
      guildId: context.guildId,
    });

    if (allTags.length === 0) {
      await context.reply({
        embeds: [createErrorEmbed('No tags found in this server!')],
      });
      return;
    }

    const tagList = allTags.map((tag) => `\`${tag.displayName}\``).join(', ');
    const guildName = context.source.guild?.name || 'this server';

    const embed = {
      color: 0x5865f2,
      title: `Tags in ${guildName}`,
      description: tagList.length > 4096 ? tagList.substring(0, 4093) + '...' : tagList,
      footer: {
        text: `Total tags: ${allTags.length}`,
      },
      timestamp: new Date(),
    };

    await context.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Failed to list tags:', error);
    await context.reply({
      embeds: [createErrorEmbed('Something went wrong while listing tags.')],
    });
  }
}
