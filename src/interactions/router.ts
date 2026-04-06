import { Events } from 'discord.js';
import { handleRepLeaderboardButton } from './interactions/buttons/repLeaderboard.button';
import { parseRepLeaderboardCustomId } from './utils/pagination/leaderboardPagination';

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (parseRepLeaderboardCustomId(interaction.customId)) {
      await handleRepLeaderboardButton(interaction);
      return;
    }
  }

  if (interaction.isChatInputCommand()) {
    // your slash command router here
  }
});
