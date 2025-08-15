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
    hasActiveMessage,
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
      // Calculate time 10 minutes from message timestamp
      const messageTime = new Date(message.timestamp);
      const endTime = new Date(messageTime.getTime() + 10 * 60 * 1000);
      const timeString = endTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      return `Do Not Disturb Until ${timeString}`;
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

  // Check if each room has active messages
  const hasRoomAMessages = getMessageCount('dashboard-a') > 0;
  const hasRoomBMessages = getMessageCount('dashboard-b') > 0;
  const hasRoomCMessages = getMessageCount('dashboard-c') > 0;

  return (
    <div className="min-h-screen w-full flex flex-col ipad-ultra-safe">
      {/* Map Section - Top area (White background) */}
      <div className="min-h-[400px] bg-white flex flex-col items-center justify-center relative p-6">
        {/* Connection Status Indicator - Bottom right */}
        <div className="absolute bottom-4 right-4">
          <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>

        {/* Room Navigation Buttons - Positioned above the map */}
        <div className="mb-6 flex gap-4 w-full px-4">
          {roomButtons.map((room) => {
            const hasMessages = hasActiveMessage(room.id);
            
            // Color coding based on room
            const getRoomColor = (roomId: string) => {
              switch (roomId) {
                case 'dashboard-a': return 'bg-blue-600 hover:bg-blue-700';
                case 'dashboard-b': return 'bg-orange-600 hover:bg-orange-700';
                case 'dashboard-c': return 'bg-green-600 hover:bg-green-700';
                default: return 'bg-gray-600 hover:bg-gray-700';
              }
            };
            

            
            return (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                disabled={!hasMessages}
                className={`
                  relative px-6 py-4 rounded-lg font-medium text-white text-base cursor-pointer flex-1
                  ${hasMessages 
                    ? getRoomColor(room.id)
                    : 'bg-gray-400 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {room.label}
                {hasMessages && (
                  <span className="absolute -top-1 -right-1 bg-red-500 rounded-full h-3 w-3"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Layered SVG Map System */}
        <div className="flex items-center justify-center flex-1">
          {/* Container with fixed aspect ratio to ensure perfect alignment */}
          <div className="relative w-[500px] h-[375px] max-w-full max-h-full">
            {/* Base Map Layer */}
            <Image
              src="/map.svg"
              alt="Floor Map"
              width={800}
              height={600}
              className="w-full h-full object-contain"
              priority
            />
            
            {/* Room A Overlay Layer */}
            {hasRoomAMessages && (
              <Image
                src="/room-a.svg"
                alt="Room A Active"
                width={800}
                height={600}
                className="absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-300"
                style={{
                  filter: roomFlashStates['dashboard-a'] ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))' : 'none'
                }}
                priority
              />
            )}
            
            {/* Room B Overlay Layer */}
            {hasRoomBMessages && (
              <Image
                src="/room-b.svg"
                alt="Room B Active"
                width={800}
                height={600}
                className="absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-300"
                style={{
                  filter: roomFlashStates['dashboard-b'] ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))' : 'none'
                }}
                priority
              />
            )}
            
            {/* Room C Overlay Layer */}
            {hasRoomCMessages && (
              <Image
                src="/room-c.svg"
                alt="Room C Active"
                width={800}
                height={600}
                className="absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-300"
                style={{
                  filter: roomFlashStates['dashboard-c'] ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))' : 'none'
                }}
                priority
              />
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      {selectedMessage ? (
        <>
          {/* Room Number Section - Color matches selected room */}
          <div className={`py-6 text-center ${
            selectedMessage.roomId === 'dashboard-a' ? 'bg-blue-600' :
            selectedMessage.roomId === 'dashboard-b' ? 'bg-orange-600' :
            selectedMessage.roomId === 'dashboard-c' ? 'bg-green-600' :
            'bg-pink-600'
          }`}>
            <h1 className="text-4xl font-bold text-white">
              Room No {roomNumberMap[selectedMessage.roomId]}
            </h1>
          </div>

          {/* Message Content and Buttons Section - Dark pink background */}
          <div className="bg-pink-600 flex flex-col items-center justify-center py-8 px-8 flex-1">
            {/* Message Content */}
            <div className="text-center mb-8 flex-1 flex items-center justify-center">
              <h2 className={`font-bold text-white leading-tight max-w-4xl ${
                selectedMessage.type === 'custom' && selectedMessage.content.length > 50 
                  ? 'text-3xl' 
                  : 'text-5xl'
              }`}>
                {formatMessageContent(selectedMessage)}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-8 mb-4 w-full px-8">
              <button
                onClick={handleSeen}
                disabled={!isConnected || selectedMessage.status === 'seen'}
                className="px-12 py-6 text-xl font-semibold bg-black text-white rounded-2xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-1 h-[80px] flex items-center justify-center gap-3 transition-all"
              >
                <Image src="/eye.png" alt="Eye" width={24} height={24} className="w-6 h-6" />
                Seen
              </button>
              
              <button
                onClick={handleResolved}
                disabled={!isConnected}
                className="px-12 py-6 text-xl font-semibold bg-white text-black rounded-2xl hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-1 h-[80px] flex items-center justify-center gap-3 transition-all"
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
          <div className="bg-pink-400 py-6 text-center">
            <h1 className="text-4xl font-bold text-white">No Messages</h1>
          </div>
          
          {/* No message content - Dark pink background */}
          <div className="bg-pink-600 flex flex-col justify-center items-center py-8 flex-1">
            <div className="text-center text-white">
              <p className="text-2xl opacity-80">Waiting for room requests...</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 