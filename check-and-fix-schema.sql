-- Check if message_flows table exists and what columns it has
-- Run this first to see current structure:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'message_flows'
ORDER BY ordinal_position;

-- If you're missing columns, add them one by one:
-- (Only run the ALTER TABLE commands for columns that are missing)

-- Add missing columns if they don't exist:
-- ALTER TABLE message_flows ADD COLUMN IF NOT EXISTS date DATE;
-- ALTER TABLE message_flows ADD COLUMN IF NOT EXISTS sent_to_seen_seconds INTEGER;
-- ALTER TABLE message_flows ADD COLUMN IF NOT EXISTS seen_to_resolved_seconds INTEGER;
-- ALTER TABLE message_flows ADD COLUMN IF NOT EXISTS total_resolution_time_seconds INTEGER;
-- ALTER TABLE message_flows ADD COLUMN IF NOT EXISTS current_status TEXT;
-- ALTER TABLE message_flows ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- If you need to completely recreate the table with the right structure:
-- (ONLY run this if you want to start fresh - it will delete all existing data)
-- DROP TABLE IF EXISTS message_flows;
-- 
-- CREATE TABLE message_flows (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   message_id TEXT NOT NULL UNIQUE,
--   date DATE NOT NULL,
--   room_id TEXT NOT NULL,
--   button_type TEXT NOT NULL,
--   button_label TEXT NOT NULL,
--   custom_text TEXT,
--   sent_timestamp TIMESTAMPTZ NOT NULL,
--   seen_timestamp TIMESTAMPTZ,
--   resolved_timestamp TIMESTAMPTZ,
--   sent_to_seen_seconds INTEGER,
--   seen_to_resolved_seconds INTEGER,
--   total_resolution_time_seconds INTEGER,
--   current_status TEXT NOT NULL CHECK (current_status IN ('sent', 'seen', 'resolved', 'cancelled')),
--   is_completed BOOLEAN NOT NULL DEFAULT false,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- ); 