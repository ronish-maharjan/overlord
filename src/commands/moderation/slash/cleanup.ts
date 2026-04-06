import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleCleanup } from '../shared/cleanup.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('cleanup')
    .setDescription('Clean up recent bot and command messages.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('How many recent messages to scan')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const amount = interaction.options.getInteger('amount') ?? 100;
    const context = new CommandContext(interaction);

    await handleCleanup({
      context,
      amount,
    });
  },
};

export default command;
