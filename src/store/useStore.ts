import { create } from 'zustand';

export type RoomAction = 'action1' | 'action2' | 'action3' | 'action4';
export type RoomState = 'state1' | 'state2' | 'state3' | 'state4' | null;

interface StoreState {
  // Current active tab
  activeTab: 'controller' | 'display';
  
  // Current room state being displayed (for full-screen display)
  activeRoomState: RoomState;
  
  // System status
  isConnected: boolean;
  isResetting: boolean;
  
  // Actions
  setActiveTab: (tab: 'controller' | 'display') => void;
  setActiveRoomState: (state: RoomState) => void;
  setConnectionStatus: (connected: boolean) => void;
  resetSystem: () => void;
  setResetting: (resetting: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  // Initial state
  activeTab: 'controller',
  activeRoomState: null,
  isConnected: false,
  isResetting: false,
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setActiveRoomState: (state) => set({ activeRoomState: state }),
  
  setConnectionStatus: (connected) => set({ isConnected: connected }),
  
  resetSystem: () =>
    set({
      activeRoomState: null,
      isResetting: false,
    }),
  
  setResetting: (resetting) => set({ isResetting: resetting }),
})); 