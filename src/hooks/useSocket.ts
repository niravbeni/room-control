import { useEffect, useRef } from 'react';
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
  const { 
    setConnectionStatus, 
    setActiveRoomState,
    resetSystem, 
    setResetting,
    isConnected 
  } = useStore();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io({
      path: '/api/socket'
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnectionStatus(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus(false);
    });

    // Room action response (top buttons - do nothing for now)
    socket.on('room-action-response', (data: { action: RoomAction }) => {
      console.log('Room action triggered (no effect):', data);
      // Do nothing for now as requested
    });

    // Room state change (bottom buttons - change display)
    socket.on('room-state-change', (data: { state: RoomState }) => {
      console.log('Room state changed:', data);
      setActiveRoomState(data.state);
    });

    // System reset event
    socket.on('system-reset', () => {
      console.log('System reset received');
      setResetting(true);
      resetSystem();
      setTimeout(() => setResetting(false), 1000);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [setConnectionStatus, setActiveRoomState, resetSystem, setResetting]);

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