import type { Message } from 'discord.js';
import { container } from '../container';
import { containsGiveRepTrigger } from '../utils/rep/repTriggers';
import { RepServiceError } from '../services/rep/rep.service';
import {
  createCannotRepBotMessage,
  createCannotRepSelfMessage,
  createGiveRepCooldownMessage,
} from '../utils/messages/repMessages';

export async function handleMessageRepTrigger(message: Message): Promise<void> {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (!message.mentions.members?.size) return;

  const content = message.content.toLowerCase();
  if (!containsGiveRepTrigger(content)) return;

  const targetMember = message.mentions.members.first();
  if (!targetMember) return;

  try {
    await container.repService.giveRep({
      guildId: message.guild.id,
      giverUserId: message.author.id,
      receiverUserId: targetMember.id,
      receiverIsBot: targetMember.user.bot,
    });

    await message.reply(`Gave 1 rep to **${targetMember.user.username}**.`);
  } catch (error) {
    if (error instanceof RepServiceError) {
      if (error.code === 'COOLDOWN_ACTIVE') {
        const cooldown = await container.repService.getCooldownStatus(
          message.guild.id,
          message.author.id,
          targetMember.id,
        );

        await message
          .reply(createGiveRepCooldownMessage(cooldown.remainingMs))
          .catch(() => null);
        return;
      }

      if (error.code === 'BOT_REP') {
        await message.reply(createCannotRepBotMessage()).catch(() => null);
        return;
      }

      if (error.code === 'SELF_REP') {
        await message.reply(createCannotRepSelfMessage()).catch(() => null);
        return;
      }

      return;
    }

    throw error;
  }
}
