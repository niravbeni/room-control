import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore, RoomAction, RoomState } from '@/store/useStore';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  emitRoomAction: (action: RoomAction) => void;
  emitRoomStateChange: (state: RoomState) => void;
  emitReset: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { 
    setActiveRoomState, 
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
    socketRef.current.on('roomStateChanged', (data: { state: RoomState }) => {
      console.log('Room state changed:', data.state);
      setActiveRoomState(data.state);
    });

    socketRef.current.on('systemReset', () => {
      console.log('System reset received');
      setActiveRoomState(null);
      setIsResetting(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [setActiveRoomState, setStoreConnected, setIsResetting]);

  // Emit functions
  const emitRoomAction = (action: RoomAction) => {
    if (socketRef.current) {
      socketRef.current.emit('room-action', { action });
    }
  };

  const emitRoomStateChange = (state: RoomState) => {
    if (socketRef.current) {
      socketRef.current.emit('room-state-change', { state });
    }
  };

  const emitReset = () => {
    if (socketRef.current) {
      socketRef.current.emit('reset-system');
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    emitRoomAction,
    emitRoomStateChange,
    emitReset,
  };
}; 