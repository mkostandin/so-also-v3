CREATE TABLE IF NOT EXISTS "app"."committees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"test_data" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."events" ADD COLUMN "test_data" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "committees_slug_idx" ON "app"."committees" ("slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "committees_name_idx" ON "app"."committees" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "committees_test_data_idx" ON "app"."committees" ("test_data");