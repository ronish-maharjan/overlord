CREATE TABLE "level_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guild_id" varchar(32) NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 0 NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "level_stats_guild_user_unique" ON "level_stats" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "level_stats_guild_xp_idx" ON "level_stats" USING btree ("guild_id","xp");--> statement-breakpoint
CREATE INDEX "level_stats_guild_level_idx" ON "level_stats" USING btree ("guild_id","level");--> statement-breakpoint
CREATE INDEX "level_stats_guild_user_idx" ON "level_stats" USING btree ("guild_id","user_id");