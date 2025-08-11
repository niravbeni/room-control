import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore, RoomId, MessageType } from '@/store/useStore';

interface UseSocketReturn {
  isConnected: boolean;
  emitMessage: (roomId: RoomId, roomNumber: string, type: MessageType, customText?: string) => void;
  emitMessageSeen: (messageId: string) => void;
  emitMessageResolved: (messageId: string, roomId?: RoomId) => void;
  emitMessageCancelled: (messageId: string) => void;
  emitReset: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { 
    markMessageSeen,
    markMessageResolved,
    cancelMessage,
    setRoomFlash,
    setIsConnected: setStoreConnected, 
    setIsResetting,
    resetSystem,
    sendMessage
  } = useStore();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3000', {
      path: '/api/socket',
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      setStoreConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      setStoreConnected(false);
    });

    // Message event handlers
    socketRef.current.on('message-sent', (data: { roomId: RoomId, roomNumber: string, type: MessageType, customText?: string, messageId: string }) => {
      // Add the message to the store for all connected clients
      // Use the messageId from the server to ensure all clients have the same message ID
      sendMessage(data.roomId, data.roomNumber, data.type, data.customText, data.messageId);
      setRoomFlash(data.roomId, true);
    });

    socketRef.current.on('message-seen', (data: { messageId: string }) => {
      markMessageSeen(data.messageId);
    });

    socketRef.current.on('message-resolved', (data: { messageId: string, roomId: RoomId }) => {
      markMessageResolved(data.messageId);
      setRoomFlash(data.roomId, false);
    });

    socketRef.current.on('message-cancelled', (data: { messageId: string }) => {
      cancelMessage(data.messageId);
    });

    socketRef.current.on('system-reset', () => {
      resetSystem();
      setIsResetting(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [markMessageSeen, markMessageResolved, cancelMessage, setRoomFlash, setStoreConnected, setIsResetting, resetSystem, sendMessage]);

  // Emit functions
  const emitMessage = (roomId: RoomId, roomNumber: string, type: MessageType, customText?: string) => {
    socketRef.current?.emit('send-message', { roomId, roomNumber, type, customText });
  };

  const emitMessageSeen = (messageId: string) => {
    socketRef.current?.emit('message-seen', { messageId });
  };

  const emitMessageResolved = (messageId: string, roomId?: RoomId) => {
    socketRef.current?.emit('message-resolved', { messageId, roomId });
  };

  const emitMessageCancelled = (messageId: string) => {
    socketRef.current?.emit('cancel-message', { messageId });
  };

  const emitReset = () => {
    socketRef.current?.emit('reset-system');
  };

  return {
    isConnected,
    emitMessage,
    emitMessageSeen,
    emitMessageResolved,
    emitMessageCancelled,
    emitReset,
  };
}; 