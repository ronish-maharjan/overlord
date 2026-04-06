import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type GuildTextBasedChannel,
  type MessageActionRowComponentBuilder,
} from 'discord.js';
import { container } from '../../container';
import { createVerificationEmbed } from '../embeds/verificationEmbeds';

export const VERIFY_BUTTON_CUSTOM_ID = 'verify:user';

export function createVerifyButtonComponents() {
  return [
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(VERIFY_BUTTON_CUSTOM_ID)
        .setLabel('Verify')
        .setStyle(ButtonStyle.Primary),
    ),
  ];
}

export async function upsertVerificationMessage(params: {
  guildId: string;
  channel: GuildTextBasedChannel;
}): Promise<string> {
  const settings = await container.verificationService.getSettings(params.guildId);

  const payload = {
    embeds: [createVerificationEmbed()],
    components: createVerifyButtonComponents(),
  };

  if (settings.verifyMessageId) {
    const existingMessage = await params.channel.messages
      .fetch(settings.verifyMessageId)
      .catch(() => null);

    if (existingMessage) {
      await existingMessage.edit(payload);
      return existingMessage.id;
    }
  }

  const newMessage = await params.channel.send(payload);

  await container.verificationService.setVerifyMessage({
    guildId: params.guildId,
    messageId: newMessage.id,
  });

  return newMessage.id;
}
