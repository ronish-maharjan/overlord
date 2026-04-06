import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { LEVEL_ROLE_MILESTONES } from '../../../utils/levels/levelMilestones';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleRemoveLevelRole } from '../shared/removelevelrole.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('removelevelrole')
    .setDescription('Remove the configured reward role for a level milestone.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) => {
      option
        .setName('level')
        .setDescription('The level milestone')
        .setRequired(true);

      for (const level of LEVEL_ROLE_MILESTONES) {
        option.addChoices({
          name: `Level ${level}`,
          value: level,
        });
      }

      return option;
    }),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const level = interaction.options.getInteger('level', true);
    const context = new CommandContext(interaction);

    await handleRemoveLevelRole({
      context,
      level,
    });
  },
};

export default command;
