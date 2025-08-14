-- Create the message_flows table for analytics tracking
CREATE TABLE message_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  date DATE NOT NULL,
  room_id TEXT NOT NULL,
  button_type TEXT NOT NULL,
  button_label TEXT NOT NULL,
  custom_text TEXT,
  sent_timestamp TIMESTAMPTZ NOT NULL,
  seen_timestamp TIMESTAMPTZ,
  resolved_timestamp TIMESTAMPTZ,
  sent_to_seen_seconds INTEGER,
  seen_to_resolved_seconds INTEGER,
  total_resolution_time_seconds INTEGER,
  current_status TEXT NOT NULL CHECK (current_status IN ('sent', 'seen', 'resolved', 'cancelled')),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_message_flows_date ON message_flows(date);
CREATE INDEX idx_message_flows_room_id ON message_flows(room_id);
CREATE INDEX idx_message_flows_button_type ON message_flows(button_type);
CREATE INDEX idx_message_flows_message_id ON message_flows(message_id);
CREATE INDEX idx_message_flows_current_status ON message_flows(current_status);

-- Enable Row Level Security (RLS)
ALTER TABLE message_flows ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for production)
CREATE POLICY "Allow all operations on message_flows" ON message_flows
FOR ALL USING (true) WITH CHECK (true);

-- Create the custom_messages table for storing custom message content
CREATE TABLE custom_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  custom_text TEXT NOT NULL,
  sent_timestamp TIMESTAMPTZ NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_custom_messages_date ON custom_messages(date);
CREATE INDEX idx_custom_messages_room_id ON custom_messages(room_id);
CREATE INDEX idx_custom_messages_message_id ON custom_messages(message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE custom_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for production)
CREATE POLICY "Allow all operations on custom_messages" ON custom_messages
FOR ALL USING (true) WITH CHECK (true);

-- Create the button_cancellations table for tracking cancelled/unclicked buttons
CREATE TABLE button_cancellations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_message_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  room_name TEXT NOT NULL,
  button_type TEXT NOT NULL,
  button_label TEXT NOT NULL,
  custom_text TEXT,
  sent_timestamp TIMESTAMPTZ NOT NULL,
  cancelled_timestamp TIMESTAMPTZ NOT NULL,
  seconds_before_cancellation INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_button_cancellations_date ON button_cancellations(date);
CREATE INDEX idx_button_cancellations_room_id ON button_cancellations(room_id);
CREATE INDEX idx_button_cancellations_button_type ON button_cancellations(button_type);
CREATE INDEX idx_button_cancellations_original_message_id ON button_cancellations(original_message_id);

-- Enable Row Level Security (RLS)
ALTER TABLE button_cancellations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for production)
CREATE POLICY "Allow all operations on button_cancellations" ON button_cancellations
FOR ALL USING (true) WITH CHECK (true); 