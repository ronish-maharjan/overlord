import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleCaseLookup } from '../shared/case.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('case')
    .setDescription('View a moderation case by ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addIntegerOption((option) =>
      option.setName('id').setDescription('Case ID').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const caseId = interaction.options.getInteger('id', true);
    const context = new CommandContext(interaction);

    await handleCaseLookup({
      context,
      caseId,
    });
  },
};

export default command;
