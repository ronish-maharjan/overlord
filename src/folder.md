src/
  bot/
    clients/
      discordClient.ts
    types/
      command.ts

  commands/
    rep/
      slash/
        giverep.ts
        rep.ts
        toprep.ts
      prefix/
        giverep.ts
        rep.ts
        toprep.ts
      shared/
        giverep.handler.ts
        rep.handler.ts
        toprep.handler.ts

  config/
    env.ts
    constants.ts

  db/
    index.ts
    schema/
      rep.ts
    migrations/

  repositories/
    rep/
      rep.repository.ts

  services/
    rep/
      rep.service.ts
      rep.cooldown.ts

  interactions/
    buttons/
      repLeaderboard.button.ts

  utils/
    embeds/
      baseEmbed.ts
      repEmbeds.ts
      errorEmbeds.ts
    pagination/
      leaderboardPagination.ts
    discord/
      memberResolver.ts
      commandContext.ts
    time/
      formatDuration.ts
    logger/
      logger.ts

  types/
    rep.ts

  app.ts
