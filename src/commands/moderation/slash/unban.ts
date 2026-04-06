import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { resolveMemberFromGuild } from '../../../utils/discord/memberResolver';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleUnban } from '../shared/unban.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option.setName('user').setDescription('Target user').setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('reason').setDescription('Reason').setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const context = new CommandContext(interaction);

    await handleUnban({
      context,
      targetUser: user,
      reason,
    });
  },
};

export default command;
