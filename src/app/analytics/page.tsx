'use client'

import { useState, useEffect } from 'react'
import { supabase, type MessageFlow, type CustomMessage } from '@/lib/supabase'
import { useAnalytics } from '@/hooks/useAnalytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

// Override global styles for analytics page
const analyticsPageStyles = `
  body {
    position: static !important;
    height: auto !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
  
  #__next {
    height: auto !important;
    overflow-y: visible !important;
  }
`

export default function AnalyticsPage() {
  const [messageFlows, setMessageFlows] = useState<MessageFlow[]>([])
  const [customMessages, setCustomMessages] = useState<CustomMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showResetCustomDialog, setShowResetCustomDialog] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resettingCustom, setResettingCustom] = useState(false)
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalCustomMessages, setTotalCustomMessages] = useState(0)
  const [activeTab, setActiveTab] = useState<'analytics' | 'custom'>('analytics')

  const { 
    resetAnalyticsData, 
    getAnalyticsCount, 
    getCustomMessages, 
    getCustomMessagesCount, 
    resetCustomMessages
  } = useAnalytics()

  useEffect(() => {
    loadAnalytics()
    loadCustomMessages()
    loadTotalRecords()
  }, [selectedDate])

  const loadTotalRecords = async () => {
    const count = await getAnalyticsCount()
    const customCount = await getCustomMessagesCount()
    setTotalRecords(count)
    setTotalCustomMessages(customCount)
  }

  const loadCustomMessages = async () => {
    const messages = await getCustomMessages(selectedDate)
    setCustomMessages(messages)
  }

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('message_flows')
        .select('*')
        .eq('date', selectedDate)
        .order('sent_timestamp', { ascending: false })

      if (error) {
        console.error('Error loading analytics:', error)
      } else {
        setMessageFlows(data || [])
      }
    } catch (err) {
      console.error('Failed to load analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Room ID',
      'Button Type',
      'Button Label',
      'Custom Text',
      'Sent Time',
      'Seen Time',
      'Resolved Time',
      'Sent to Seen (seconds)',
      'Seen to Resolved (seconds)',
      'Total Resolution Time (seconds)',
      'Status',
      'Completed'
    ]

    const csvData = messageFlows.map(flow => [
      flow.date,
      flow.room_id,
      flow.button_type,
      flow.button_label,
      flow.custom_text || '',
      flow.sent_timestamp,
      flow.seen_timestamp || '',
      flow.resolved_timestamp || '',
      flow.sent_to_seen_seconds || '',
      flow.seen_to_resolved_seconds || '',
      flow.total_resolution_time_seconds || '',
      flow.current_status,
      flow.is_completed
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `room-control-analytics-${selectedDate}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleResetConfirm = async () => {
    setResetting(true)
    try {
      await resetAnalyticsData()
      setMessageFlows([])
      setTotalRecords(0)
      setShowResetDialog(false)
      // Show success message or toast here if you want
    } catch (error) {
      console.error('Failed to reset analytics:', error)
      // Show error message here if you want
    } finally {
      setResetting(false)
    }
  }

  const handleResetCustomConfirm = async () => {
    setResettingCustom(true)
    try {
      await resetCustomMessages()
      setCustomMessages([])
      setTotalCustomMessages(0)
      setShowResetCustomDialog(false)
      // Show success message or toast here if you want
    } catch (error) {
      console.error('Failed to reset custom messages:', error)
      // Show error message here if you want
    } finally {
      setResettingCustom(false)
    }
  }

  const exportCustomMessagesToCSV = () => {
    const headers = [
      'Date',
      'Time',
      'Room ID',
      'Room Name',
      'Custom Message'
    ]

    const csvData = customMessages.map(msg => [
      msg.date,
      new Date(msg.sent_timestamp).toLocaleTimeString(),
      msg.room_id,
      msg.room_name,
      msg.custom_text
    ])

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `custom-messages-${selectedDate}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getRoomStats = () => {
    const stats = {
      'dashboard-a': { total: 0, completed: 0, avgTime: 0 },
      'dashboard-b': { total: 0, completed: 0, avgTime: 0 },
      'dashboard-c': { total: 0, completed: 0, avgTime: 0 }
    }

    messageFlows.forEach(flow => {
      const roomKey = flow.room_id as keyof typeof stats
      if (stats[roomKey]) {
        stats[roomKey].total++
        if (flow.is_completed) {
          stats[roomKey].completed++
        }
      }
    })

    // Calculate average resolution times
    Object.keys(stats).forEach(roomId => {
      const roomFlows = messageFlows.filter(f => f.room_id === roomId && f.total_resolution_time_seconds)
      if (roomFlows.length > 0) {
        const avgTime = roomFlows.reduce((sum, f) => sum + (f.total_resolution_time_seconds || 0), 0) / roomFlows.length
        stats[roomId as keyof typeof stats].avgTime = Math.round(avgTime)
      }
    })

    return stats
  }

  const getButtonStats = () => {
    const buttonTypes = ['delay', 'water', 'cancel', 'custom']
    return buttonTypes.map(type => {
      const flows = messageFlows.filter(f => f.button_type === type)
      const completed = flows.filter(f => f.is_completed).length
      const avgTime = flows.length > 0 
        ? Math.round(flows.reduce((sum, f) => sum + (f.total_resolution_time_seconds || 0), 0) / flows.length)
        : 0
      
      return {
        type,
        label: flows[0]?.button_label || type,
        total: flows.length,
        completed,
        completionRate: flows.length > 0 ? Math.round((completed / flows.length) * 100) : 0,
        avgTime
      }
    })
  }

  const roomStats = getRoomStats()
  const buttonStats = getButtonStats()

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getRoomName = (roomId: string) => {
    switch (roomId) {
      case 'dashboard-a': return 'Room 139'
      case 'dashboard-b': return 'Room 143'
      case 'dashboard-c': return 'Room 150'
      default: return roomId
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: analyticsPageStyles }} />
      <div className="bg-gray-50 p-6 min-h-screen">
        <div className="max-w-7xl mx-auto pb-16">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Room Control Analytics</h1>
            <div className="text-sm text-gray-600">
              Analytics: <span className="font-semibold">{totalRecords}</span> | 
              Custom Messages: <span className="font-semibold">{totalCustomMessages}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Button Analytics
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors ${
                activeTab === 'custom' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Custom Messages ({customMessages.length})
            </button>
          </div>
          
          {/* Date Selector and Export */}
          <div className="flex items-center gap-4 mb-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Select Date
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 cursor-pointer"
              />
            </div>
            <div className="mt-6 flex gap-3">
              {activeTab === 'analytics' ? (
                <>
                  <Button onClick={exportToCSV} disabled={messageFlows.length === 0} className="cursor-pointer">
                    Export Analytics CSV
                  </Button>
                  <Button 
                    onClick={() => setShowResetDialog(true)} 
                    disabled={totalRecords === 0}
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    Reset Analytics
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={exportCustomMessagesToCSV} disabled={customMessages.length === 0} className="cursor-pointer">
                    Export Custom Messages CSV
                  </Button>
                  <Button 
                    onClick={() => setShowResetCustomDialog(true)} 
                    disabled={totalCustomMessages === 0}
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    Reset Custom Messages
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading analytics...</div>
        ) : activeTab === 'analytics' ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Object.entries(roomStats).map(([roomId, stats]) => (
                <Card key={roomId}>
                  <CardHeader>
                    <CardTitle>{getRoomName(roomId)}</CardTitle>
                    <CardDescription>Daily Statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Messages:</span>
                        <span className="font-semibold">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-semibold">{stats.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate:</span>
                        <span className="font-semibold">
                          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Resolution:</span>
                        <span className="font-semibold">{formatTime(stats.avgTime)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Individual Button Events */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Individual Button Events</CardTitle>
                <CardDescription>Each button press with detailed timing for {selectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                {messageFlows.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No button events found for this date.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Time Sent</th>
                          <th className="text-left py-2">Room</th>
                          <th className="text-left py-2">Button</th>
                          <th className="text-left py-2">Status</th>
                          <th className="text-left py-2">Sent→Seen</th>
                          <th className="text-left py-2">Seen→Resolved</th>
                          <th className="text-left py-2">Total Resolution</th>
                          <th className="text-left py-2">Custom Text</th>
                        </tr>
                      </thead>
                      <tbody>
                        {messageFlows.map((flow) => (
                          <tr key={flow.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 font-mono">
                              {new Date(flow.sent_timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2 font-medium">{getRoomName(flow.room_id)}</td>
                            <td className="py-2">{flow.button_label}</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                flow.current_status === 'resolved' ? 'bg-green-100 text-green-800' :
                                flow.current_status === 'seen' ? 'bg-yellow-100 text-yellow-800' :
                                flow.current_status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {flow.current_status}
                              </span>
                            </td>

                            <td className="py-2 font-medium">
                              {flow.sent_to_seen_seconds !== null && flow.sent_to_seen_seconds !== undefined ? (
                                <span className="text-blue-600">{formatTime(flow.sent_to_seen_seconds)}</span>
                              ) : '-'}
                            </td>
                            <td className="py-2 font-medium">
                              {flow.seen_to_resolved_seconds !== null && flow.seen_to_resolved_seconds !== undefined ? (
                                <span className="text-orange-600">{formatTime(flow.seen_to_resolved_seconds)}</span>
                              ) : '-'}
                            </td>
                            <td className="py-2 font-medium">
                              {flow.total_resolution_time_seconds !== null && flow.total_resolution_time_seconds !== undefined ? (
                                <span className="text-green-600">{formatTime(flow.total_resolution_time_seconds)}</span>
                              ) : '-'}
                            </td>
                            <td className="py-2 max-w-xs truncate text-gray-600">
                              {flow.custom_text || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Average timing data by button type for {selectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                                          <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Button Type</th>
                          <th className="text-left py-2">Total Presses</th>
                          <th className="text-left py-2">Completion Rate</th>
                          <th className="text-left py-2">Avg Sent→Seen</th>
                          <th className="text-left py-2">Avg Seen→Resolved</th>
                          <th className="text-left py-2">Avg Total Resolution</th>
                        </tr>
                      </thead>
                    <tbody>
                      {buttonStats.map((stat) => {
                        // Calculate individual timing averages
                        const flowsForButton = messageFlows.filter(f => f.button_type === stat.type)
                        const sentToSeenTimes = flowsForButton
                          .filter(f => f.sent_to_seen_seconds !== null)
                          .map(f => f.sent_to_seen_seconds!)
                        const seenToResolvedTimes = flowsForButton
                          .filter(f => f.seen_to_resolved_seconds !== null)
                          .map(f => f.seen_to_resolved_seconds!)
                        
                        const avgSentToSeen = sentToSeenTimes.length > 0 
                          ? Math.round(sentToSeenTimes.reduce((a, b) => a + b, 0) / sentToSeenTimes.length)
                          : 0
                        const avgSeenToResolved = seenToResolvedTimes.length > 0
                          ? Math.round(seenToResolvedTimes.reduce((a, b) => a + b, 0) / seenToResolvedTimes.length)
                          : 0

                        return (
                          <tr key={stat.type} className="border-b hover:bg-gray-50">
                            <td className="py-2 font-medium">{stat.label}</td>
                            <td className="py-2">{stat.total}</td>
                            <td className="py-2">
                              <span className={`font-medium ${stat.completionRate >= 80 ? 'text-green-600' : stat.completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                {stat.completionRate}%
                              </span>
                            </td>
                            <td className="py-2">
                              <span className="text-blue-600 font-medium">
                                {avgSentToSeen > 0 ? formatTime(avgSentToSeen) : '-'}
                              </span>
                            </td>
                            <td className="py-2">
                              <span className="text-orange-600 font-medium">
                                {avgSeenToResolved > 0 ? formatTime(avgSeenToResolved) : '-'}
                              </span>
                            </td>
                            <td className="py-2">
                              <span className="text-green-600 font-medium">
                                {stat.avgTime > 0 ? formatTime(stat.avgTime) : '-'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Custom Messages View */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Messages</CardTitle>
                <CardDescription>All custom messages for {selectedDate}</CardDescription>
              </CardHeader>
              <CardContent>
                {customMessages.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No custom messages found for this date.</p>
                ) : (
                  <div className="space-y-4">
                    {customMessages.map((message) => (
                      <div key={message.id} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-600">{message.room_name}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(message.sent_timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">{message.date}</span>
                        </div>
                        <div className="bg-white rounded p-3 border-l-4 border-blue-500">
                          <p className="text-gray-900">{message.custom_text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Reset Analytics Confirmation Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Analytics Data</DialogTitle>
              <DialogDescription>
                This will permanently delete all {totalRecords} analytics records. This action cannot be undone.
                <br /><br />
                Are you sure you want to reset all analytics data?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowResetDialog(false)}
                disabled={resetting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleResetConfirm}
                disabled={resetting}
                className="cursor-pointer"
              >
                {resetting ? 'Resetting...' : 'Reset Analytics'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Custom Messages Confirmation Dialog */}
        <Dialog open={showResetCustomDialog} onOpenChange={setShowResetCustomDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Custom Messages</DialogTitle>
              <DialogDescription>
                This will permanently delete all {totalCustomMessages} custom messages. This action cannot be undone.
                <br /><br />
                Are you sure you want to reset all custom messages?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowResetCustomDialog(false)}
                disabled={resettingCustom}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleResetCustomConfirm}
                disabled={resettingCustom}
                className="cursor-pointer"
              >
                {resettingCustom ? 'Resetting...' : 'Reset Custom Messages'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </>
  )
} 