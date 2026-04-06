CREATE TABLE "verification_settings" (
	"guild_id" varchar(32) PRIMARY KEY NOT NULL,
	"verified_role_id" varchar(32),
	"verify_channel_id" varchar(32),
	"verify_message_id" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
