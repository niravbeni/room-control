import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface MessageFlow {
  id: string
  message_id: string
  date: string
  room_id: string
  button_type: string
  button_label: string
  custom_text?: string
  sent_timestamp: string
  seen_timestamp?: string
  resolved_timestamp?: string
  sent_to_seen_seconds?: number
  seen_to_resolved_seconds?: number
  total_resolution_time_seconds?: number
  current_status: 'sent' | 'seen' | 'resolved' | 'cancelled'
  is_completed: boolean
  created_at: string
}

export interface CustomMessage {
  id: string
  message_id: string
  room_id: string
  room_name: string
  custom_text: string
  sent_timestamp: string
  date: string
  created_at: string
}

export interface ButtonCancellation {
  id: string
  original_message_id: string
  room_id: string
  room_name: string
  button_type: string
  button_label: string
  custom_text?: string
  sent_timestamp: string
  cancelled_timestamp: string
  seconds_before_cancellation: number
  date: string
  created_at: string
} 