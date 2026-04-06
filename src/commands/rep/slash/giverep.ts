import { SlashCommandBuilder, type ChatInputCommandInteraction } from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleGiveRep } from '../shared/giverep.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('giverep')
    .setDescription('Give reputation to another member.')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('The member to give reputation to')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user', true);

    if (!interaction.guild) {
      await interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true,
      });
      return;
    }

    const member = await interaction.guild.members
      .fetch(targetUser.id)
      .catch(() => null);

    const context = new CommandContext(interaction);

    await handleGiveRep({
      context,
      receiverMember: member,
    });
  },
};

export default command;
