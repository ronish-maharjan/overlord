import type { PrefixCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import {
  handleCreateTag,
  handleViewTag,
  handleEditTag,
  handleDeleteTag,
  handleTagInfo,
  handleListTags,
} from '../shared/tag.handler';

const command: PrefixCommand = {
  name: 'tag',
  aliases: ['t'],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.guild) {
      await context.reply({
        embeds: [createErrorEmbed('This command can only be used inside a server.')],
      });
      return;
    }

    if (args.length === 0) {
      await context.reply({
        embeds: [
          createErrorEmbed(
            '**Usage:**\n' +
              '`?tag <tagname>` - View a tag\n' +
              '`?tag create <tagname> <content>` - Create a tag\n' +
              '`?tag edit <tagname> <content>` - Edit your tag\n' +
              '`?tag delete <tagname>` - Delete your tag\n' +
              '`?tag info <tagname>` - View tag information\n' +
              '`?tag list` - List all tags'
          ),
        ],
      });
      return;
    }

    const subcommand = args[0].toLowerCase();
    const tagName = args[1]?.toLowerCase();

    switch (subcommand) {
      case 'create':
      case 'add': {
        if (!tagName) {
          await context.reply({
            embeds: [createErrorEmbed('**Usage:** `?tag create <tagname> <content>`')],
          });
          return;
        }

        const tagContent = args.slice(2).join(' ');
        if (!tagContent) {
          await context.reply({
            embeds: [
              createErrorEmbed(
                'Please provide content for the tag!\n**Usage:** `?tag create <tagname> <content>`'
              ),
            ],
          });
          return;
        }

        await handleCreateTag({ context, tagName, tagContent });
        break;
      }

      case 'edit':
      case 'update': {
        if (!tagName) {
          await context.reply({
            embeds: [createErrorEmbed('**Usage:** `?tag edit <tagname> <new content>`')],
          });
          return;
        }

        const newContent = args.slice(2).join(' ');
        if (!newContent) {
          await context.reply({
            embeds: [
              createErrorEmbed(
                'Please provide new content for the tag!\n**Usage:** `?tag edit <tagname> <new content>`'
              ),
            ],
          });
          return;
        }

        await handleEditTag({ context, tagName, newContent });
        break;
      }

      case 'delete':
      case 'remove':
      case 'del': {
        if (!tagName) {
          await context.reply({
            embeds: [createErrorEmbed('**Usage:** `?tag delete <tagname>`')],
          });
          return;
        }

        await handleDeleteTag({ context, tagName });
        break;
      }

      case 'info':
      case 'about': {
        if (!tagName) {
          await context.reply({
            embeds: [createErrorEmbed('**Usage:** `?tag info <tagname>`')],
          });
          return;
        }

        await handleTagInfo({ context, tagName });
        break;
      }

      case 'list':
      case 'all': {
        await handleListTags({ context });
        break;
      }

      default: {
        await handleViewTag({ context, tagName: subcommand });
        break;
      }
    }
  },
};

export default command;
