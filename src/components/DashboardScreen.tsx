'use client';

import { useMemo, useState } from 'react';
import { useStore, RoomId, MessageType } from '@/store/useStore';
import { useSocket } from '@/hooks/useSocket';
import { Badge } from '@/components/ui/badge';

interface DashboardScreenProps {
  roomNumber: string;
  roomId: RoomId;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ roomNumber, roomId }) => {
  const [customMessage, setCustomMessage] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const { 
    isConnected,
    messages // Subscribe to messages array to trigger re-renders
  } = useStore();
  
  const { emitMessage, emitMessageCancelled } = useSocket();
  
  // Get latest custom message specifically
  const latestCustomMessage = useMemo(() => {
    const customMessages = messages.filter(msg => msg.roomId === roomId && msg.type === 'custom');
    return customMessages.length > 0 ? customMessages[customMessages.length - 1] : null;
  }, [messages, roomId]);
  

  
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
    
    // For custom messages, show input field
    if (type === 'custom') {
      setShowCustomInput(true);
      return;
    }
    
    // Otherwise, send the message
    handleSendMessage(type, customText);
  };

  const handleSendMessage = (type: MessageType, customText?: string) => {
    // Only emit the message - the socket event handler will create the message in the store
    emitMessage(roomId, roomNumber, type, customText);
  };
  
  const handleCustomMessageSend = () => {
    if (customMessage.trim()) {
      handleSendMessage('custom', customMessage.trim());
      setCustomMessage('');
      setShowCustomInput(false);
    }
  };
  
  const handleCustomMessageCancel = () => {
    setCustomMessage('');
    setShowCustomInput(false);
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
    const status = getMessageStatus(messageType);
    const hasAnyActiveMessage = messages.some(msg => msg.roomId === roomId && (msg.status === 'sent' || msg.status === 'seen'));
    const isThisButtonActive = status === 'sent' || status === 'seen';
    const isDisabled = hasAnyActiveMessage && !isThisButtonActive;
    
    const baseClasses = "w-full h-full text-white rounded-2xl flex flex-col items-center justify-center gap-4 text-3xl font-semibold shadow-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Special styling for custom message button
    if (messageType === 'custom') {
      const customBaseClasses = "w-full h-full rounded-2xl flex flex-col items-center justify-center gap-4 text-3xl font-semibold shadow-lg transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-4 border-dashed border-gray-400";
      
      // Sent status - grey with yellow border
      if (status === 'sent') {
        return `${customBaseClasses} border-yellow-400`;
      }
      
      // Seen status - grey with green border
      if (status === 'seen') {
        return `${customBaseClasses} border-green-400`;
      }
      
      // Normal state - grey background with dashed border
      if (isDisabled) {
        return `${customBaseClasses} cursor-not-allowed opacity-50`;
      }
      
      return `${customBaseClasses}`;
    }
    
    // Get room-specific colors - all pink for other buttons
    const getRoomColors = () => {
      return 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700';
    };
    
    // Sent status - darker pink with yellow border
    if (status === 'sent') {
      return `${baseClasses} bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 border-4 border-yellow-400`;
    }
    
    // Seen status - darker pink with green border
    if (status === 'seen') {
      return `${baseClasses} bg-gradient-to-br from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 border-4 border-green-400`;
    }
    
    // Normal state (idle or resolved) - disabled if other button is active
    if (isDisabled) {
      return `${baseClasses} bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed opacity-50`;
    }
    
    return `${baseClasses} bg-gradient-to-br ${getRoomColors()}`;
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="py-4 px-6 text-center flex-shrink-0">
        <h1 className="text-3xl font-normal text-black">
          Send quick messages to the catering
        </h1>
      </div>
      
      {/* Message Buttons Container - Full remaining height */}
      <div className="flex-1 p-4 pb-16">
        <div className="h-full w-full">
          <div className="grid grid-cols-2 gap-3 h-full w-full">
            
            {/* Do Not Disturb Button */}
            <div className="relative">
              <button
                className={getButtonClasses('delay')}
                onClick={() => handleButtonClick('delay')}
                disabled={!isConnected || (messages.some(msg => msg.roomId === roomId && (msg.status === 'sent' || msg.status === 'seen')) && getMessageStatus('delay') !== 'sent' && getMessageStatus('delay') !== 'seen')}
              >
                <span className="text-6xl">⏰</span>
                <span className="text-center leading-tight px-4">
                  Do Not Disturb<br />For 10min
                </span>
              </button>
              {renderStatusBadge('delay')}
            </div>

            {/* Refill Water Button */}
            <div className="relative">
              <button
                className={getButtonClasses('water')}
                onClick={() => handleButtonClick('water')}
                disabled={!isConnected || (messages.some(msg => msg.roomId === roomId && (msg.status === 'sent' || msg.status === 'seen')) && getMessageStatus('water') !== 'sent' && getMessageStatus('water') !== 'seen')}
              >
                <span className="text-6xl">💧</span>
                <span className="text-center leading-tight px-4">
                  Refill<br />Water
                </span>
              </button>
              {renderStatusBadge('water')}
            </div>

            {/* Refill Fridge & Snacks Button */}
            <div className="relative">
              <button
                className={getButtonClasses('cancel')}
                onClick={() => handleButtonClick('cancel')}
                disabled={!isConnected || (messages.some(msg => msg.roomId === roomId && (msg.status === 'sent' || msg.status === 'seen')) && getMessageStatus('cancel') !== 'sent' && getMessageStatus('cancel') !== 'seen')}
              >
                <span className="text-6xl">🍿</span>
                <span className="text-center leading-tight px-4">
                  Refill Fridge &<br />Snacks
                </span>
              </button>
              {renderStatusBadge('cancel')}
            </div>

            {/* Custom Message Button */}
            <div className="relative">
              {showCustomInput ? (
                <div className="w-full h-full bg-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4" style={{backgroundColor: '#E1E1E1'}}>
                  <span className="text-5xl">✏️</span>
                  <div className="w-full">
                    <textarea
                      value={customMessage}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                        if (e.target.value.length <= 100) {
                          setCustomMessage(e.target.value);
                        }
                      }}
                      placeholder="Enter custom message..."
                      className="w-full text-center text-sm px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 cursor-text bg-white text-gray-800 placeholder-gray-500 resize-none h-20"
                      onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => e.key === 'Enter' && !e.shiftKey && handleCustomMessageSend()}
                      autoFocus
                      maxLength={100}
                    />
                    <div className="text-xs text-gray-600 mt-1 text-center">
                      {customMessage.length}/100 characters
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCustomMessageSend}
                      disabled={!customMessage.trim() || !isConnected}
                      className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Send
                    </button>
                    <button
                      onClick={handleCustomMessageCancel}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={getButtonClasses('custom')}
                  onClick={() => handleButtonClick('custom')}
                  disabled={!isConnected || (messages.some(msg => msg.roomId === roomId && (msg.status === 'sent' || msg.status === 'seen')) && getMessageStatus('custom') !== 'sent' && getMessageStatus('custom') !== 'seen')}
                  style={{backgroundColor: '#E1E1E1'}}
                >
                  <span className="text-6xl">✏️</span>
                  <span className="text-center leading-tight px-4 text-gray-700">
                    {latestCustomMessage && latestCustomMessage.customText 
                      ? (latestCustomMessage.customText.length > 50 
                          ? latestCustomMessage.customText.substring(0, 50) + '...' 
                          : latestCustomMessage.customText)
                      : 'Custom Message'
                    }
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