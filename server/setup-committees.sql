-- Create committees table
CREATE TABLE IF NOT EXISTS "app"."committees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"test_data" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL
);

-- Add test_data column to events table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'app' AND table_name = 'events' AND column_name = 'test_data') THEN
        ALTER TABLE "app"."events" ADD COLUMN "test_data" boolean DEFAULT false NOT NULL;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS "committees_slug_idx" ON "app"."committees" ("slug");
CREATE INDEX IF NOT EXISTS "committees_name_idx" ON "app"."committees" ("name");
CREATE INDEX IF NOT EXISTS "committees_test_data_idx" ON "app"."committees" ("test_data");

-- Insert some sample committee data for testing
INSERT INTO "app"."committees" ("name", "slug", "test_data", "last_seen") VALUES
('NECYPAA', 'necypaa', true, now()),
('MSCYPAA', 'mscypaa', true, now()),
('RISCYPAA', 'riscypaa', true, now()),
('NHSCYPAA', 'nhscypaa', true, now()),
('NECYPAA ADVISORY', 'necypaa-advisory', true, now()),
('RHODE ISLAND BID FOR NECYPAA', 'rhode-island-bid-for-necypaa', true, now())
ON CONFLICT ("slug") DO NOTHING;



