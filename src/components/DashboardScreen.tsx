'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore, RoomId, MessageType } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';

interface DashboardScreenProps {
  roomNumber: string;
  roomId: RoomId;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ roomNumber, roomId }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [activeButton, setActiveButton] = useState<MessageType | null>(null);
  
  const { 
    getLatestMessageForRoom,
    isConnected,
    messages // Subscribe to messages array to trigger re-renders
  } = useStore();
  
  const { emitMessage, emitMessageCancelled } = useSocket();
  
  // Get latest message and make it reactive to messages changes
  const latestMessage = useMemo(() => {
    return getLatestMessageForRoom(roomId);
  }, [getLatestMessageForRoom, roomId]);
  
  // Reset active button when message is resolved
  useEffect(() => {
    if (latestMessage && latestMessage.status === 'resolved') {
      setActiveButton(null);
    }
  }, [latestMessage]);
  
  const handleButtonClick = (type: MessageType, customText?: string) => {
    const status = getMessageStatus(type);
    
    // If message is already sent, cancel it
    if (status === 'sent') {
      const messagesByType = messages.filter(msg => msg.roomId === roomId && msg.type === type);
      const latestMessageOfType = messagesByType.length > 0 ? messagesByType[messagesByType.length - 1] : null;
      
      if (latestMessageOfType) {
        emitMessageCancelled(latestMessageOfType.id);
      }
      return;
    }
    
    // Otherwise, send the message
    handleSendMessage(type, customText);
  };

  const handleSendMessage = (type: MessageType, customText?: string) => {
    setActiveButton(type);
    // Only emit the message - the socket event handler will create the message in the store
    emitMessage(roomId, roomNumber, type, customText);
    
    if (type === 'custom') {
      setCustomMessage('');
      setShowCustomInput(false);
    }
    
    // Reset active state after a brief moment
    setTimeout(() => setActiveButton(null), 200);
  };
  
  const handleCustomMessage = () => {
    if (showCustomInput && customMessage.trim()) {
      handleButtonClick('custom', customMessage.trim());
    } else {
      setShowCustomInput(true);
    }
  };
  
  const getMessageStatus = (messageType: MessageType) => {
    // Find the latest message of this specific type, not just the overall latest message
    const messagesByType = messages.filter(msg => msg.roomId === roomId && msg.type === messageType);
    const latestMessageOfType = messagesByType.length > 0 ? messagesByType[messagesByType.length - 1] : null;
    
    return latestMessageOfType ? latestMessageOfType.status : 'idle';
  };
  
  const renderStatusBadge = (messageType: MessageType) => {
    const status = getMessageStatus(messageType);
    
    if (status === 'sent') {
      return (
        <div className="absolute top-4 right-4 bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Sent
        </div>
      );
    }
    
    if (status === 'seen') {
      return (
        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          Seen
        </div>
      );
    }
    
    return null;
  };

  const getButtonClasses = (messageType: MessageType) => {
    const isPressed = activeButton === messageType;
    const status = getMessageStatus(messageType);
    const baseClasses = "w-full h-full text-white rounded-2xl flex flex-col items-center justify-center gap-4 text-2xl font-semibold shadow-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Sent status - yellow border
    if (status === 'sent') {
      return `${baseClasses} bg-gradient-to-br from-pink-500 to-pink-600 border-4 border-yellow-400 hover:from-pink-600 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98]`;
    }
    
    // Seen status - green border
    if (status === 'seen') {
      return `${baseClasses} bg-gradient-to-br from-pink-500 to-pink-600 border-4 border-green-400 hover:from-pink-600 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98]`;
    }
    
    // Pressed state
    if (isPressed) {
      return `${baseClasses} bg-gradient-to-br from-pink-700 to-pink-800 hover:from-pink-800 hover:to-pink-900 hover:scale-[1.02] active:scale-[0.98]`;
    }
    
    // Normal state (idle or resolved)
    return `${baseClasses} bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:scale-[1.02] active:scale-[0.98]`;
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-6 px-6 text-center flex-shrink-0">
        <h1 className="text-3xl font-normal text-black">
          Send quick messages to the catering
        </h1>
      </div>
      
      {/* Message Buttons Container - Full remaining height */}
      <div className="flex-1 p-6">
        <div className="h-full">
          <div className="grid grid-cols-2 gap-4 h-full">
            
            {/* Delay Service Button */}
            <div className="relative h-full">
              <button
                className={getButtonClasses('delay')}
                onClick={() => handleButtonClick('delay')}
                disabled={!isConnected}
              >
                <span className="text-6xl">⏰</span>
                <span className="text-center leading-tight px-4">
                  Delay the service<br />by 15mins
                </span>
              </button>
              {renderStatusBadge('delay')}
            </div>

            {/* Water Bottles Button */}
            <div className="relative h-full">
              <button
                className={getButtonClasses('water')}
                onClick={() => handleButtonClick('water')}
                disabled={!isConnected}
              >
                <span className="text-6xl">💧</span>
                <span className="text-center leading-tight px-4">
                  Bring new<br />water bottles
                </span>
              </button>
              {renderStatusBadge('water')}
            </div>

            {/* Cancel Coffee Button */}
            <div className="relative h-full">
              <button
                className={getButtonClasses('cancel')}
                onClick={() => handleButtonClick('cancel')}
                disabled={!isConnected}
              >
                <span className="text-6xl">❌</span>
                <span className="text-center leading-tight px-4">
                  Cancel the coffee<br />order
                </span>
              </button>
              {renderStatusBadge('cancel')}
            </div>

            {/* Custom Message Button */}
            <div className="relative h-full">
              {showCustomInput ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 border-4 border-dashed border-gray-400 rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
                  <span className="text-5xl">✏️</span>
                  <input
                    value={customMessage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom message..."
                    className="w-full text-center text-lg px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text"
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCustomMessage()}
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCustomMessage}
                      disabled={!customMessage.trim() || !isConnected}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Send
                    </button>
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 border-4 border-dashed border-gray-400 rounded-2xl flex flex-col items-center justify-center gap-4 text-xl font-semibold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowCustomInput(true)}
                  disabled={!isConnected}
                >
                  <span className="text-6xl">✏️</span>
                  <span className="text-center leading-tight px-4">
                    Custom message
                  </span>
                </button>
              )}
              {!showCustomInput && renderStatusBadge('custom')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 