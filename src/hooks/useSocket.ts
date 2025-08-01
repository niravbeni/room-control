import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore, RoomAction, RoomState } from '@/store/useStore';

interface UseSocketReturn {
  isConnected: boolean;
  emitRoomAction: (action: RoomAction) => void;
  emitRoomStateChange: (state: RoomState) => void;
  emitCustomMessage: (message: string) => void; // Add custom message emit function
  emitReset: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { 
    setActiveRoomState, 
    setCustomMessage,
    setIsConnected: setStoreConnected, 
    setIsResetting 
  } = useStore();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io();

    // Connection event handlers
    socketRef.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setStoreConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setStoreConnected(false);
    });

    // Room state events
    socketRef.current.on('room-state-change', (data: { state: RoomState }) => {
      console.log('Room state changed:', data.state);
      setActiveRoomState(data.state);
    });

    // Custom message events
    socketRef.current.on('custom-message', (data: { message: string }) => {
      console.log('Custom message received:', data.message);
      setCustomMessage(data.message);
      setActiveRoomState('custom');
    });

    socketRef.current.on('system-reset', () => {
      console.log('System reset received');
      setActiveRoomState(null);
      setIsResetting(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [setActiveRoomState, setCustomMessage, setStoreConnected, setIsResetting]);

  // Emit functions
  const emitRoomAction = (action: RoomAction) => {
    socketRef.current?.emit('room-action', { action });
  };

  const emitRoomStateChange = (state: RoomState) => {
    socketRef.current?.emit('room-state-change', { state });
  };

  const emitCustomMessage = (message: string) => {
    socketRef.current?.emit('custom-message', { message });
  };

  const emitReset = () => {
    socketRef.current?.emit('reset-system');
  };

  return {
    isConnected,
    emitRoomAction,
    emitRoomStateChange,
    emitCustomMessage,
    emitReset,
  };
}; 