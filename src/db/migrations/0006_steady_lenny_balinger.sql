CREATE TABLE "tags" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tags_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"guild_id" varchar(20) NOT NULL,
	"tag_name" varchar(100) NOT NULL,
	"tag_content" text NOT NULL,
	"owner_id" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tags_guild_id_tag_name_unique" UNIQUE("guild_id","tag_name")
);
