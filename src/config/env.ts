import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  PREFIX: z.string().default('?'),

  REP_SAME_USER_COOLDOWN_MINUTES: z.coerce.number().default(60),
  REP_DIFFERENT_USER_COOLDOWN_MINUTES: z.coerce.number().default(2),
});

export const env = envSchema.parse(process.env);
