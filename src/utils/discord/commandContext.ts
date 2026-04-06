import type {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionReplyOptions,
  Message,
  MessageCreateOptions,
  User,
} from 'discord.js';

export type CommandContextSource = ChatInputCommandInteraction | Message;

export class CommandContext {
  public readonly source: CommandContextSource;

  constructor(source: CommandContextSource) {
    this.source = source;
  }

  get isSlash(): boolean {
    return 'isChatInputCommand' in this.source;
  }

  get guildId(): string | null {
    return this.source.guildId;
  }

  get user(): User {
    return this.isSlash ? this.source.user : this.source.author;
  }

  get member(): GuildMember | null {
    return this.source.member instanceof Object
      ? (this.source.member as GuildMember)
      : null;
  }

  async reply(options: {
    content?: string;
    embeds?: MessageCreateOptions['embeds'];
    components?: MessageCreateOptions['components'];
  }) {
    if (this.isSlash) {
      const interaction = this.source as ChatInputCommandInteraction;

      const interactionOptions: InteractionReplyOptions = {
        content: options.content,
        embeds: options.embeds,
        components: options.components,
      };

      if (interaction.replied || interaction.deferred) {
        return interaction.followUp(interactionOptions);
      }

      return interaction.reply({
        ...interactionOptions,
        fetchReply: true,
      });
    }

    const message = this.source as Message;

    return message.reply({
      content: options.content,
      embeds: options.embeds,
      components: options.components,
    });
  }
}
