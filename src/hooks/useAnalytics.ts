import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { MessageFlow, CustomMessage, ButtonCancellation } from '@/lib/supabase'
import type { RoomId, MessageType } from '@/store/useStore'

export const useAnalytics = () => {
  // Track when a button is clicked (message sent)
  const trackButtonClick = useCallback(async (
    messageId: string,
    roomId: RoomId,
    buttonType: MessageType,
    customText?: string
  ) => {
    const buttonLabels = {
      delay: 'Delay Service',
      water: 'Water Bottles', 
      cancel: 'Cancel Order',
      custom: 'Custom Message'
    }

    const roomNames = {
      'dashboard-a': 'Room 139',
      'dashboard-b': 'Room 143', 
      'dashboard-c': 'Room 150'
    }

    const now = new Date().toISOString()
    const today = new Date().toISOString().split('T')[0]

    const messageFlow = {
      message_id: messageId,
      date: today,
      room_id: roomId,
      button_type: buttonType,
      button_label: buttonLabels[buttonType],
      custom_text: customText || null,
      sent_timestamp: now,
      seen_timestamp: null,
      resolved_timestamp: null,
      sent_to_seen_seconds: null,
      seen_to_resolved_seconds: null,
      total_resolution_time_seconds: null,
      current_status: 'sent',
      is_completed: false
    }

    try {
      // Use upsert to handle duplicates gracefully
      const { error } = await supabase
        .from('message_flows')
        .upsert([messageFlow], { 
          onConflict: 'message_id',
          ignoreDuplicates: true 
        })
      
      if (error) {
        console.error('Error tracking button click:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        console.error('Message data being inserted:', messageFlow)
      }

      // If it's a custom message, also save to custom_messages table
      if (buttonType === 'custom' && customText) {
        const customMessage = {
          message_id: messageId,
          room_id: roomId,
          room_name: roomNames[roomId as keyof typeof roomNames],
          custom_text: customText,
          sent_timestamp: now,
          date: today
        }

        // Use upsert for custom messages too
        const { error: customError } = await supabase
          .from('custom_messages')
          .upsert([customMessage], { 
            onConflict: 'message_id',
            ignoreDuplicates: true 
          })

        if (customError) {
          console.error('Error saving custom message:', customError)
          console.error('Custom error details:', JSON.stringify(customError, null, 2))
          console.error('Custom message data:', customMessage)
        }
      }
    } catch (err) {
      console.error('Failed to track button click:', err)
    }
  }, [])

  // Track when message is marked as seen
  const trackMessageSeen = useCallback(async (messageId: string) => {
    const now = new Date().toISOString()

    try {
      // Get the original message to calculate timing
      const { data: existingMessage, error: fetchError } = await supabase
        .from('message_flows')
        .select('*')
        .eq('message_id', messageId)
        .single()

      if (fetchError || !existingMessage) {
        console.error('Error fetching message for seen update:', fetchError)
        return
      }

      // Calculate time difference
      const sentTime = new Date(existingMessage.sent_timestamp)
      const seenTime = new Date(now)
      const sentToSeenSeconds = Math.floor((seenTime.getTime() - sentTime.getTime()) / 1000)

      const { error } = await supabase
        .from('message_flows')
        .update({
          seen_timestamp: now,
          sent_to_seen_seconds: sentToSeenSeconds,
          current_status: 'seen'
        })
        .eq('message_id', messageId)

      if (error) {
        console.error('Error tracking message seen:', error)
      }
    } catch (err) {
      console.error('Failed to track message seen:', err)
    }
  }, [])

  // Track when message is marked as resolved
  const trackMessageResolved = useCallback(async (messageId: string) => {
    const now = new Date().toISOString()

    try {
      // Get the current message state to calculate timing
      const { data: existingMessage, error: fetchError } = await supabase
        .from('message_flows')
        .select('*')
        .eq('message_id', messageId)
        .single()

      if (fetchError || !existingMessage) {
        console.error('Error fetching message for resolved update:', fetchError)
        return
      }

      // Calculate time differences
      const sentTime = new Date(existingMessage.sent_timestamp)
      const seenTime = existingMessage.seen_timestamp ? new Date(existingMessage.seen_timestamp) : null
      const resolvedTime = new Date(now)

      const totalResolutionSeconds = Math.floor((resolvedTime.getTime() - sentTime.getTime()) / 1000)
      const seenToResolvedSeconds = seenTime 
        ? Math.floor((resolvedTime.getTime() - seenTime.getTime()) / 1000)
        : null

      const { error } = await supabase
        .from('message_flows')
        .update({
          resolved_timestamp: now,
          seen_to_resolved_seconds: seenToResolvedSeconds,
          total_resolution_time_seconds: totalResolutionSeconds,
          current_status: 'resolved',
          is_completed: true
        })
        .eq('message_id', messageId)

      if (error) {
        console.error('Error tracking message resolved:', error)
      }
    } catch (err) {
      console.error('Failed to track message resolved:', err)
    }
  }, [])

  // Track when message is cancelled
  const trackMessageCancelled = useCallback(async (messageId: string) => {
    try {
      // First get the original message details
      const { data: originalMessage, error: fetchError } = await supabase
        .from('message_flows')
        .select('*')
        .eq('message_id', messageId)
        .single()

      if (fetchError || !originalMessage) {
        console.error('Error fetching original message for cancellation:', fetchError)
        return
      }

      const now = new Date().toISOString()
      const today = new Date().toISOString().split('T')[0]
      
      // Calculate time before cancellation
      const sentTime = new Date(originalMessage.sent_timestamp)
      const cancelledTime = new Date(now)
      const secondsBeforeCancellation = Math.floor((cancelledTime.getTime() - sentTime.getTime()) / 1000)

      const roomNames = {
        'dashboard-a': 'Room 139',
        'dashboard-b': 'Room 143', 
        'dashboard-c': 'Room 150'
      }

      // Create cancellation record
      const cancellation = {
        original_message_id: messageId,
        room_id: originalMessage.room_id,
        room_name: roomNames[originalMessage.room_id as keyof typeof roomNames],
        button_type: originalMessage.button_type,
        button_label: originalMessage.button_label,
        custom_text: originalMessage.custom_text,
        sent_timestamp: originalMessage.sent_timestamp,
        cancelled_timestamp: now,
        seconds_before_cancellation: secondsBeforeCancellation,
        date: today
      }

      // Check if cancellation already exists to avoid duplicates
      const { data: existingCancellation } = await supabase
        .from('button_cancellations')
        .select('original_message_id')
        .eq('original_message_id', messageId)
        .limit(1)

      // Only insert if cancellation doesn't exist
      if (!existingCancellation || existingCancellation.length === 0) {
        const { error: cancellationError } = await supabase
          .from('button_cancellations')
          .insert([cancellation])

        if (cancellationError) {
          console.error('Error saving cancellation record:', cancellationError)
        }
      }

      // Update original message status
      const { error } = await supabase
        .from('message_flows')
        .update({
          current_status: 'cancelled'
        })
        .eq('message_id', messageId)

      if (error) {
        console.error('Error tracking message cancelled:', error)
      }
    } catch (err) {
      console.error('Failed to track message cancelled:', err)
    }
  }, [])

  // Reset all analytics data
  const resetAnalyticsData = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('message_flows')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

      if (error) {
        console.error('Error resetting analytics data:', error)
        throw error
      }

      return { success: true }
    } catch (err) {
      console.error('Failed to reset analytics data:', err)
      throw err
    }
  }, [])

  // Get total record count for confirmation
  const getAnalyticsCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('message_flows')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error getting analytics count:', error)
        return 0
      }

      return count || 0
    } catch (err) {
      console.error('Failed to get analytics count:', err)
      return 0
    }
  }, [])

  // Get all custom messages
  const getCustomMessages = useCallback(async (date?: string) => {
    try {
      let query = supabase
        .from('custom_messages')
        .select('*')
        .order('sent_timestamp', { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error getting custom messages:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Failed to get custom messages:', err)
      return []
    }
  }, [])

  // Get custom messages count
  const getCustomMessagesCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('custom_messages')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error getting custom messages count:', error)
        return 0
      }

      return count || 0
    } catch (err) {
      console.error('Failed to get custom messages count:', err)
      return 0
    }
  }, [])

  // Reset custom messages data
  const resetCustomMessages = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('custom_messages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

      if (error) {
        console.error('Error resetting custom messages:', error)
        throw error
      }

      return { success: true }
    } catch (err) {
      console.error('Failed to reset custom messages:', err)
      throw err
    }
  }, [])

  // Get button cancellations
  const getButtonCancellations = useCallback(async (date?: string) => {
    try {
      let query = supabase
        .from('button_cancellations')
        .select('*')
        .order('cancelled_timestamp', { ascending: false })

      if (date) {
        query = query.eq('date', date)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error getting button cancellations:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Failed to get button cancellations:', err)
      return []
    }
  }, [])

  // Get button cancellations count
  const getButtonCancellationsCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('button_cancellations')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error getting button cancellations count:', error)
        return 0
      }

      return count || 0
    } catch (err) {
      console.error('Failed to get button cancellations count:', err)
      return 0
    }
  }, [])

  // Reset button cancellations data
  const resetButtonCancellations = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('button_cancellations')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

      if (error) {
        console.error('Error resetting button cancellations:', error)
        throw error
      }

      return { success: true }
    } catch (err) {
      console.error('Failed to reset button cancellations:', err)
      throw err
    }
  }, [])

  return {
    trackButtonClick,
    trackMessageSeen,
    trackMessageResolved,
    trackMessageCancelled,
    resetAnalyticsData,
    getAnalyticsCount,
    getCustomMessages,
    getCustomMessagesCount,
    resetCustomMessages,
    getButtonCancellations,
    getButtonCancellationsCount,
    resetButtonCancellations
  }
} 