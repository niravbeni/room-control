'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useStore, RoomId } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';
import { useAudio } from '@/hooks/useAudio';

export const CateringScreen: React.FC = () => {
  const { 
    activeMessages,
    roomFlashStates,
    selectMessage,
    getSelectedMessage,
    hasActiveMessage,
    isConnected
  } = useStore();
  
  const { emitMessageSeen, emitMessageResolved } = useSocket();
  const { playRoomAlert } = useAudio();
  
  const selectedMessage = getSelectedMessage();
  
  // Auto-select messages without requiring room tab clicks
  useEffect(() => {
    console.log('🔔 CateringScreen: activeMessages changed, length:', activeMessages.length);
    console.log('🔔 Active messages:', activeMessages.map(m => ({ id: m.id, roomId: m.roomId, type: m.type, status: m.status })));
    
    if (activeMessages.length > 0) {
      // Always auto-select the latest message (most recent)
      const latestMessage = activeMessages[activeMessages.length - 1];
      console.log('📨 Latest message:', latestMessage.roomId, latestMessage.type, latestMessage.content, 'status:', latestMessage.status);
      selectMessage(latestMessage.id);
      
      // ONLY play sound for NEW messages (not seen/resolved messages)
      if (latestMessage.status === 'sent') {
        console.log('🎵 Playing sound for NEW message:', latestMessage.roomId);
        playRoomAlert(latestMessage.roomId);
      } else {
        console.log('🔇 NOT playing sound - message status is:', latestMessage.status);
      }
    } else {
      console.log('📭 No active messages');
    }
  }, [activeMessages.length, activeMessages, selectMessage, playRoomAlert]);

  // Room number mapping
  const roomNumberMap: { [key in RoomId]: string } = {
    'dashboard-a': '121'
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
      console.log('👁️ Seen button clicked - NO AUDIO should play');
      
      // Debug: Check for any audio elements on the page
      const allAudioElements = document.querySelectorAll('audio');
      console.log('🔍 All audio elements on page:', allAudioElements.length);
      allAudioElements.forEach((audio, index) => {
        console.log(`Audio ${index}:`, {
          src: audio.src,
          paused: audio.paused,
          currentTime: audio.currentTime,
          volume: audio.volume,
          id: audio.id,
          className: audio.className
        });
      });
      
      // Also check for any audio elements that might be created dynamically
      console.log('🔍 Checking for sounds played via Web Audio or other methods...');
      
      // Check if any sounds are currently playing
      const playingAudio = Array.from(allAudioElements).filter(audio => !audio.paused);
      if (playingAudio.length > 0) {
        console.warn('🚨 Found playing audio elements:', playingAudio);
      }
      
      emitMessageSeen(selectedMessage.id);
      
      // Debug: Check again after the emit to see if anything started playing
      setTimeout(() => {
        const stillPlayingAudio = Array.from(document.querySelectorAll('audio')).filter(audio => !audio.paused);
        if (stillPlayingAudio.length > 0) {
          console.warn('🚨 Audio playing AFTER seen click:', stillPlayingAudio);
        }
      }, 100);
    }
  };

  const handleResolved = () => {
    if (selectedMessage) {
      emitMessageResolved(selectedMessage.id, selectedMessage.roomId);
    }
  };

  // Room selection buttons (temporary - will be replaced with map)
  const roomButtons = [
    { id: 'dashboard-a' as RoomId, label: 'Room 121' }
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

  // Check if room has active messages
  const hasRoomAMessages = getMessageCount('dashboard-a') > 0;

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
            
            // Color coding for room
            const getRoomColor = () => {
              return 'bg-blue-600 hover:bg-blue-700';
            };
            

            
            return (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                disabled={!hasMessages}
                className={`
                  relative px-6 py-4 rounded-lg font-medium text-white text-base cursor-pointer flex-1
                  ${hasMessages 
                    ? getRoomColor()
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
            

            

          </div>
        </div>
      </div>

      {/* Content Section */}
      {selectedMessage ? (
        <>
          {/* Room Number Section - Color matches selected room */}
          <div className="py-6 text-center bg-blue-600">
            <h1 className="text-4xl font-bold text-white">
              Room No {roomNumberMap[selectedMessage.roomId]}
            </h1>
          </div>

          {/* Message Content and Buttons Section - Dark pink background */}
          <div className="bg-pink-600 flex flex-col items-center justify-center py-8 px-8 flex-1">
            {/* Timestamp Section - Semi-transparent text */}
            <div className="text-center mb-4">
              <p className="text-white text-2xl opacity-60">
                Sent at {new Date(selectedMessage.timestamp).toLocaleTimeString([], { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            </div>

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