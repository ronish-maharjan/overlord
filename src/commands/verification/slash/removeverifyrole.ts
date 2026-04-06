import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from 'discord.js';
import type { SlashCommand } from '../../../bot/types/command';
import { CommandContext } from '../../../utils/discord/commandContext';
import { handleRemoveVerifyRole } from '../shared/removeverifyrole.handler';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('removeverifyrole')
    .setDescription('Remove the verified role.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const context = new CommandContext(interaction);

    await handleRemoveVerifyRole({
      context,
    });
  },
};

export default command;
