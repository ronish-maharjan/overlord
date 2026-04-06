import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleHistory } from '../shared/history.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('history')
    .setDescription('View moderation history for a user.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('Target user').setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user', true);
    const context = new CommandContext(interaction);

    await handleHistory({
      context,
      targetUserId: user.id,
      targetLabel: user.tag,
      page: 1,
    });
  },
};

export default command;
