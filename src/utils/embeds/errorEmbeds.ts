import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../config/constants';

export function createErrorEmbed(message: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.ERROR)
    .setDescription(`❌ ${message}`)
    .setTimestamp(new Date());
}
