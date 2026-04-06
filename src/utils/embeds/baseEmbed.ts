import { EmbedBuilder } from 'discord.js';
import { EMBED_COLORS } from '../../config/constants';

export function createBaseEmbed() {
  return new EmbedBuilder()
    .setColor(EMBED_COLORS.PRIMARY)
    .setTimestamp(new Date());
}
