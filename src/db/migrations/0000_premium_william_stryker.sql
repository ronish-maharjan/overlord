CREATE TABLE "rep_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guild_id" varchar(32) NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"reps_received" integer DEFAULT 0 NOT NULL,
	"reps_given" integer DEFAULT 0 NOT NULL,
	"last_rep_given_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rep_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"guild_id" varchar(32) NOT NULL,
	"giver_user_id" varchar(32) NOT NULL,
	"receiver_user_id" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rep_stats_guild_user_unique" ON "rep_stats" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "rep_stats_guild_leaderboard_idx" ON "rep_stats" USING btree ("guild_id","reps_received");--> statement-breakpoint
CREATE INDEX "rep_stats_guild_user_idx" ON "rep_stats" USING btree ("guild_id","user_id");--> statement-breakpoint
CREATE INDEX "rep_transactions_guild_giver_idx" ON "rep_transactions" USING btree ("guild_id","giver_user_id");--> statement-breakpoint
CREATE INDEX "rep_transactions_guild_receiver_idx" ON "rep_transactions" USING btree ("guild_id","receiver_user_id");--> statement-breakpoint
CREATE INDEX "rep_transactions_guild_created_idx" ON "rep_transactions" USING btree ("guild_id","created_at");