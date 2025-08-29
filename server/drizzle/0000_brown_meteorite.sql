CREATE SCHEMA "app";
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "session_type" AS ENUM('workshop', 'panel', 'main', 'marathon');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "event_type" AS ENUM('Event', 'Committee Meeting', 'Conference', 'YPAA Meeting', 'Other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "flag_reason" AS ENUM('incorrect_time', 'wrong_address', 'broken_link', 'duplicate', 'not_ypaa', 'inappropriate', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "flag_status" AS ENUM('open', 'resolved', 'dismissed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "flag_target" AS ENUM('event', 'conference', 'session', 'series');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "series_type" AS ENUM('Committee Meeting', 'YPAA Meeting');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."conferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"program_url" text,
	"hotel_map_url" text,
	"flyer_url" text,
	"starts_at_utc" timestamp with time zone,
	"ends_at_utc" timestamp with time zone,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."conference_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conference_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "session_type" NOT NULL,
	"room" text,
	"desc" text,
	"starts_at_utc" timestamp with time zone,
	"ends_at_utc" timestamp with time zone,
	"status" "status" DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"event_type" "event_type" NOT NULL,
	"committee" text,
	"committee_slug" text,
	"description" text,
	"address" text,
	"city" text,
	"state_prov" text,
	"country" text,
	"postal" text,
	"latitude" numeric,
	"longitude" numeric,
	"flyer_url" text,
	"website_url" text,
	"contact_email" text,
	"contact_phone" text,
	"image_urls" jsonb DEFAULT '[]'::jsonb,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"starts_at_utc" timestamp with time zone,
	"ends_at_utc" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."flags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "flag_target" NOT NULL,
	"target_id" text NOT NULL,
	"committee_slug" text,
	"reason" "flag_reason" NOT NULL,
	"message" text,
	"contact_email" text,
	"status" "flag_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text,
	"device_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "series_type" NOT NULL,
	"committee" text,
	"committee_slug" text,
	"timezone" text NOT NULL,
	"start_time_local" text NOT NULL,
	"duration_mins" integer NOT NULL,
	"rrule" jsonb NOT NULL,
	"ex_dates" jsonb,
	"overrides" jsonb,
	"address" text,
	"city" text,
	"state_prov" text,
	"country" text,
	"postal" text,
	"latitude" numeric,
	"longitude" numeric,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"notify_topic" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"committee" text,
	"committee_slug" text,
	"starts_at_local" text NOT NULL,
	"ends_at_local" text NOT NULL,
	"starts_at_utc" timestamp with time zone NOT NULL,
	"ends_at_utc" timestamp with time zone NOT NULL,
	"address" text,
	"city" text,
	"state_prov" text,
	"country" text,
	"postal" text,
	"latitude" numeric,
	"longitude" numeric,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"notify_topic" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app"."ratelimits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "conf_sessions_conf_start_idx" ON "app"."conference_sessions" ("conference_id",""conference_sessions"."starts_at_utc" asc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_status_ends_idx" ON "app"."events" ("status","ends_at_utc");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "events_committee_status_ends_idx" ON "app"."events" ("committee_slug","status","ends_at_utc");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app"."conference_sessions" ADD CONSTRAINT "conference_sessions_conference_id_conferences_id_fk" FOREIGN KEY ("conference_id") REFERENCES "app"."conferences"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "app"."occurrences" ADD CONSTRAINT "occurrences_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "app"."series"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
