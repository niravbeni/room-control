'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useStore, RoomId } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';

export const CateringScreen: React.FC = () => {
  const { 
    activeMessages,
    selectedMessageId,
    roomFlashStates,
    selectMessage,
    getSelectedMessage,
    isConnected
  } = useStore();
  
  const { emitMessageSeen, emitMessageResolved } = useSocket();
  
  const selectedMessage = getSelectedMessage();
  
  // Auto-select first message if none selected
  useEffect(() => {
    if (activeMessages.length > 0 && !selectedMessageId) {
      selectMessage(activeMessages[0].id);
    }
  }, [activeMessages, selectedMessageId, selectMessage]);

  // Room number mapping
  const roomNumberMap: { [key in RoomId]: string } = {
    'dashboard-a': '139',
    'dashboard-b': '143', 
    'dashboard-c': '150'
  };

  // Format message content with time calculation for delay messages
  const formatMessageContent = (message: { type: string; timestamp: number; content: string }) => {
    if (message.type === 'delay') {
      // Calculate time 15 minutes from message timestamp
      const messageTime = new Date(message.timestamp);
      const delayTime = new Date(messageTime.getTime() + 15 * 60 * 1000);
      const timeString = delayTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      return `Delay service for ${timeString}`;
    }
    return message.content;
  };

  const handleSeen = () => {
    if (selectedMessage) {
      emitMessageSeen(selectedMessage.id);
    }
  };

  const handleResolved = () => {
    if (selectedMessage) {
      emitMessageResolved(selectedMessage.id, selectedMessage.roomId);
    }
  };

  // Room selection buttons (temporary - will be replaced with map)
  const roomButtons = [
    { id: 'dashboard-a' as RoomId, label: 'Room 139' },
    { id: 'dashboard-b' as RoomId, label: 'Room 143' },
    { id: 'dashboard-c' as RoomId, label: 'Room 150' }
  ];

  const handleRoomClick = (roomId: RoomId) => {
    const roomMessages = activeMessages.filter(msg => msg.roomId === roomId);
    
    if (roomMessages.length > 0) {
      // Get the latest message for this room
      const latestMessage = roomMessages[roomMessages.length - 1];
      selectMessage(latestMessage.id);
    }
  };

  const getMessageCount = (roomId: RoomId) => {
    return activeMessages.filter(msg => msg.roomId === roomId).length;
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Map Section - Top area (White background) */}
      <div className="flex-1 bg-white flex items-center justify-center relative">
        {/* Connection Status Indicator - Top right */}
        <div className="absolute top-4 right-4">
          <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>

        {/* Map placeholder area - keep space for the floor plan */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-xl font-medium">Floor Map Area</p>
            <p className="text-sm mt-1">Map will be placed here</p>
          </div>
        </div>

        {/* Room Navigation Buttons - Positioned over the map area */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-3">
          {roomButtons.map((room) => {
            const messageCount = getMessageCount(room.id);
            const hasMessages = messageCount > 0;
            const isFlashing = roomFlashStates[room.id];
            const isSelected = selectedMessage && selectedMessage.roomId === room.id;
            
            return (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                disabled={!hasMessages}
                className={`
                  relative px-3 py-1.5 rounded font-medium text-white transition-all duration-300 text-sm cursor-pointer
                  ${hasMessages 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed opacity-50'
                  }
                  ${isSelected ? 'bg-blue-700' : ''}
                  ${isFlashing ? 'animate-pulse bg-green-500 hover:bg-green-600' : ''}
                `}
              >
                {room.label}
                {messageCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {messageCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Section */}
      {selectedMessage ? (
        <>
          {/* Room Number Section - Light pink background */}
          <div className="bg-pink-400 py-8 text-center">
            <h1 className="text-4xl font-bold text-white">
              Room No {roomNumberMap[selectedMessage.roomId]}
            </h1>
          </div>

          {/* Message Content and Buttons Section - Dark pink background */}
          <div className="bg-pink-600 flex flex-col items-center justify-center py-8 px-8 min-h-[320px]">
            {/* Message Content */}
            <div className="text-center mb-8 flex-1 flex items-center justify-center">
              <h2 className="text-5xl font-bold text-white leading-tight max-w-4xl">
                {formatMessageContent(selectedMessage)}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSeen}
                disabled={!isConnected || selectedMessage.status === 'seen'}
                className="px-8 py-4 text-xl font-semibold bg-black text-white rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[160px] h-[60px] flex items-center justify-center gap-3 transition-all"
              >
                <Image src="/eye.png" alt="Eye" width={24} height={24} className="w-6 h-6" />
                Seen
              </button>
              
              <button
                onClick={handleResolved}
                disabled={!isConnected}
                className="px-8 py-4 text-xl font-semibold bg-white text-black rounded-2xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-w-[160px] h-[60px] flex items-center justify-center gap-3 transition-all"
              >
                <Image src="/resolved.png" alt="Resolve" width={24} height={24} className="w-6 h-6" />
                Resolved
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* No message state - Light pink header */}
          <div className="bg-pink-400 py-8 text-center">
            <h1 className="text-4xl font-bold text-white">No Messages</h1>
          </div>
          
          {/* No message content - Dark pink background */}
          <div className="bg-pink-600 flex flex-col justify-center items-center py-8 min-h-[320px]">
            <div className="text-center text-white">
              <p className="text-2xl opacity-80">Waiting for room requests...</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 