import { PermissionFlagsBits } from 'discord.js';
import type { PrefixCommand } from '../../../bot/types/command';
import { LEVEL_ROLE_MILESTONES, isValidLevelRoleMilestone } from '../../../utils/levels/levelMilestones';
import { CommandContext } from '../../../utils/discord/commandContext';
import { createErrorEmbed } from '../../../utils/embeds/errorEmbeds';
import { handleSetLevelRole } from '../shared/setlevelrole.handler';

const command: PrefixCommand = {
  name: 'setlevelrole',
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
    const role = message.mentions.roles.first() ?? null;

    if (!Number.isInteger(level) || !isValidLevelRoleMilestone(level) || !role) {
      await context.reply({
        embeds: [
          createErrorEmbed(
            `Usage: \`?setlevelrole <level> @role\`\nValid levels: ${LEVEL_ROLE_MILESTONES.join(', ')}`,
          ),
        ],
      });
      return;
    }

    await handleSetLevelRole({
      context,
      level,
      role,
    });
  },
};

export default command;
