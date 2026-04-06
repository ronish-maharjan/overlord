import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Message,
} from 'discord.js';

export interface SlashCommand {
  data: SlashCommandBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface PrefixCommand {
  name: string;
  aliases?: string[];
  execute(message: Message, args: string[]): Promise<void>;
}
