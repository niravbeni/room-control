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