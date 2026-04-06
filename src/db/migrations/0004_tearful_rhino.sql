CREATE TABLE "moderation_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" varchar(32) NOT NULL,
	"target_user_id" varchar(32) NOT NULL,
	"moderator_user_id" varchar(32) NOT NULL,
	"action_type" varchar(32) NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"resolved" boolean DEFAULT true NOT NULL,
	"channel_id" varchar(32),
	"message_id" varchar(32)
);
--> statement-breakpoint
CREATE TABLE "moderation_settings" (
	"guild_id" varchar(32) PRIMARY KEY NOT NULL,
	"mod_logs_channel_id" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "moderation_actions_guild_target_idx" ON "moderation_actions" USING btree ("guild_id","target_user_id");--> statement-breakpoint
CREATE INDEX "moderation_actions_guild_created_idx" ON "moderation_actions" USING btree ("guild_id","created_at");--> statement-breakpoint
CREATE INDEX "moderation_actions_guild_type_idx" ON "moderation_actions" USING btree ("guild_id","action_type");