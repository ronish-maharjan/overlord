import { EmbedBuilder } from 'discord.js';
import { createBaseEmbed } from './baseEmbed';

export function createVerificationEmbed(): EmbedBuilder {
  return createBaseEmbed()
    .setTitle('Verification')
    .setDescription('Click the button below to verify and gain access to the server.');
}
