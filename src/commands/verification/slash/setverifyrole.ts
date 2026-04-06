import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleSetVerifyRole } from '../shared/setverifyrole.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setverifyrole')
    .setDescription('Set the verified role.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
      option.setName('role').setDescription('Verified role').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role', true);
    const context = new CommandContext(interaction);

    await handleSetVerifyRole({
      context,
      role,
    });
  },
};

export default command;
