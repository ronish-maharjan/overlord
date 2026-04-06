import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { LEVEL_ROLE_MILESTONES, isValidLevelRoleMilestone } from '../../../utils/levels/levelMilestones';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleRemoveLevelRole } from '../shared/removelevelrole.handler';

const command: PrefixCommand = {
  name: 'removelevelrole',
  aliases: [],

  async execute(message, args) {
    const context = new CommandContext(message);

    if (!message.guild || !message.member) {
      await context.reply({
        embeds: [createErrorEmbed('This command can only be used inside a server.')],
      });
      return;
    }

    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      await context.reply({
        embeds: [createErrorEmbed('You do not have permission to use this command.')],
      });
      return;
    }

    const level = Number(args[0]);

    if (!Number.isInteger(level) || !isValidLevelRoleMilestone(level)) {
      await context.reply({
        embeds: [
          createErrorEmbed(
            `Usage: \`?removelevelrole <level>\`\nValid levels: ${LEVEL_ROLE_MILESTONES.join(', ')}`,
          ),
        ],
      });
      return;
    }

    await handleRemoveLevelRole({
      context,
      level,
    });
  },
};

export default command;
