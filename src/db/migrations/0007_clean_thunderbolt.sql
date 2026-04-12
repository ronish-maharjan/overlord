ALTER TABLE "tags" ADD COLUMN "display_name" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "tags" ADD COLUMN "uses" bigint DEFAULT 0 NOT NULL;