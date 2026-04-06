import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { LEVEL_ROLE_MILESTONES } from '../../../utils/levels/levelMilestones';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleSetLevelRole } from '../shared/setlevelrole.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setlevelrole')
    .setDescription('Set the reward role for a level milestone.')
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
    })
    .addRoleOption((option) =>
      option
        .setName('role')
        .setDescription('The reward role for that level')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const level = interaction.options.getInteger('level', true);
    const role = interaction.options.getRole('role', true);

    const context = new CommandContext(interaction);

    await handleSetLevelRole({
      context,
      level,
      role,
    });
  },
};

export default command;
