CREATE TABLE "level_role_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" varchar(32) NOT NULL,
	"level" integer NOT NULL,
	"role_id" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "level_settings" (
	"guild_id" varchar(32) PRIMARY KEY NOT NULL,
	"level_logs_channel_id" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "level_role_rewards_guild_level_unique" ON "level_role_rewards" USING btree ("guild_id","level");--> statement-breakpoint
CREATE INDEX "level_role_rewards_guild_level_idx" ON "level_role_rewards" USING btree ("guild_id","level");--> statement-breakpoint
CREATE INDEX "level_role_rewards_guild_role_idx" ON "level_role_rewards" USING btree ("guild_id","role_id");