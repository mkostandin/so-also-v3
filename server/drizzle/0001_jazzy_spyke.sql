ALTER TYPE "session_type" ADD VALUE 'dance';--> statement-breakpoint
ALTER TYPE "session_type" ADD VALUE 'event';--> statement-breakpoint
ALTER TYPE "session_type" ADD VALUE 'main_meeting';--> statement-breakpoint
ALTER TABLE "app"."conferences" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "app"."conferences" ADD COLUMN "image_urls" text[];