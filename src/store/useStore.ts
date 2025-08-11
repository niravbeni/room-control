import { create } from 'zustand';

export type RoomId = 'dashboard-a' | 'dashboard-b' | 'dashboard-c';
export type MessageType = 'delay' | 'water' | 'cancel' | 'custom';
export type MessageStatus = 'idle' | 'sent' | 'seen' | 'resolved';

export interface Message {
  id: string;
  roomId: RoomId;
  roomNumber: string;
  type: MessageType;
  content: string;
  customText?: string;
  timestamp: number;
  status: MessageStatus;
}

export interface RoomFlashState {
  [key: string]: boolean; // roomId -> isFlashing
}

interface RoomStore {
  // Multi-room message tracking
  messages: Message[];
  activeMessages: Message[]; // Messages that haven't been resolved
  selectedMessageId: string | null; // Currently selected message on catering screen
  roomFlashStates: RoomFlashState;
  
  // Connection state
  isConnected: boolean;
  isResetting: boolean;
  
  // Message actions
  sendMessage: (roomId: RoomId, roomNumber: string, type: MessageType, customText?: string, messageId?: string) => void;
  markMessageSeen: (messageId: string) => void;
  markMessageResolved: (messageId: string) => void;
  cancelMessage: (messageId: string) => void;
  selectMessage: (messageId: string | null) => void;
  
  // Room flash actions
  setRoomFlash: (roomId: RoomId, isFlashing: boolean) => void;
  
  // Connection actions
  setIsConnected: (connected: boolean) => void;
  setIsResetting: (resetting: boolean) => void;
  
  // Reset actions
  resetSystem: () => void;
  
  // Getters
  getMessagesByRoom: (roomId: RoomId) => Message[];
  getLatestMessageForRoom: (roomId: RoomId) => Message | null;
  getSelectedMessage: () => Message | null;
}

// Helper function to get message content based on type
function getMessageContent(type: MessageType, customText?: string): string {
  switch (type) {
    case 'delay':
      return 'Delay the service by 15mins';
    case 'water':
      return 'Bring new water bottles';
    case 'cancel':
      return 'Cancel the coffee order';
    case 'custom':
      return customText || 'Custom message';
    default:
      return 'Unknown message';
  }
}

export const useStore = create<RoomStore>((set, get) => ({
  // Initial state
  messages: [],
  activeMessages: [],
  selectedMessageId: null,
  roomFlashStates: {},
  isConnected: false,
  isResetting: false,
  
  // Message actions
  sendMessage: (roomId, roomNumber, type, customText, messageId) => {
    const message: Message = {
      id: messageId || `${roomId}-${Date.now()}`,
      roomId,
      roomNumber,
      type,
      content: getMessageContent(type, customText),
      customText,
      timestamp: Date.now(),
      status: 'sent',
    };
    
    set((state) => ({
      messages: [...state.messages, message],
      activeMessages: [...state.activeMessages, message],
      roomFlashStates: { ...state.roomFlashStates, [roomId]: true }
    }));
  },
  
  markMessageSeen: (messageId) => {
    set((state) => {
      const updatedMessages = state.messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'seen' as MessageStatus } : msg
      );
      const updatedActiveMessages = state.activeMessages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'seen' as MessageStatus } : msg
      );
      
      return {
        messages: updatedMessages,
        activeMessages: updatedActiveMessages
      };
    });
  },
  
  markMessageResolved: (messageId) => {
    set((state) => {
      const resolvedMessage = state.messages.find(msg => msg.id === messageId);
      return {
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, status: 'resolved' as MessageStatus } : msg
        ),
        activeMessages: state.activeMessages.filter(msg => msg.id !== messageId),
        selectedMessageId: state.selectedMessageId === messageId ? null : state.selectedMessageId,
        roomFlashStates: resolvedMessage ? 
          { ...state.roomFlashStates, [resolvedMessage.roomId]: false } : 
          state.roomFlashStates
      };
    });
  },

  cancelMessage: (messageId) => {
    set((state) => {
      const cancelledMessage = state.messages.find(msg => msg.id === messageId);
      return {
        messages: state.messages.filter(msg => msg.id !== messageId),
        activeMessages: state.activeMessages.filter(msg => msg.id !== messageId),
        selectedMessageId: state.selectedMessageId === messageId ? null : state.selectedMessageId,
        roomFlashStates: cancelledMessage ? 
          { ...state.roomFlashStates, [cancelledMessage.roomId]: false } : 
          state.roomFlashStates
      };
    });
  },
  
  selectMessage: (messageId) => {
    set({ selectedMessageId: messageId });
  },
  
  // Room flash actions
  setRoomFlash: (roomId, isFlashing) => {
    set((state) => ({
      roomFlashStates: { ...state.roomFlashStates, [roomId]: isFlashing }
    }));
  },
  
  // Connection actions
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsResetting: (resetting) => set({ isResetting: resetting }),
  
  // Reset actions
  resetSystem: () => {
    set({
      messages: [],
      activeMessages: [],
      selectedMessageId: null,
      roomFlashStates: {},
      isResetting: false,
    });
  },
  
  // Getters
  getMessagesByRoom: (roomId) => {
    return get().messages.filter(msg => msg.roomId === roomId);
  },
  
  getLatestMessageForRoom: (roomId) => {
    const roomMessages = get().messages.filter(msg => msg.roomId === roomId);
    return roomMessages.length > 0 ? roomMessages[roomMessages.length - 1] : null;
  },
  
  getSelectedMessage: () => {
    const { messages, selectedMessageId } = get();
    return selectedMessageId ? messages.find(msg => msg.id === selectedMessageId) || null : null;
  },
})); 