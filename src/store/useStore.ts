import { create } from 'zustand';

export type RoomAction = 'tech-support' | 'room-refresh' | 'extend-booking' | 'coffee-lunch';
export type RoomState = 'state1' | 'state2' | 'state3' | 'state4' | null;

interface RoomStore {
  activeRoomState: RoomState;
  isConnected: boolean;
  isResetting: boolean;
  resetCallbacks: Array<() => void>; // Add callback system for reset
  setActiveRoomState: (state: RoomState) => void;
  setIsConnected: (connected: boolean) => void;
  setIsResetting: (resetting: boolean) => void;
  addResetCallback: (callback: () => void) => void;
  removeResetCallback: (callback: () => void) => void;
  triggerReset: () => void;
}

export const useStore = create<RoomStore>((set, get) => ({
  activeRoomState: null,
  isConnected: false,
  isResetting: false,
  resetCallbacks: [],
  
  setActiveRoomState: (state) => set({ activeRoomState: state }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsResetting: (resetting) => set({ isResetting: resetting }),
  
  addResetCallback: (callback) => set((state) => ({
    resetCallbacks: [...state.resetCallbacks, callback]
  })),
  
  removeResetCallback: (callback) => set((state) => ({
    resetCallbacks: state.resetCallbacks.filter(cb => cb !== callback)
  })),
  
  triggerReset: () => {
    // Reset the main state
    set({ activeRoomState: null, isResetting: false });
    // Trigger all registered callbacks
    const { resetCallbacks } = get();
    resetCallbacks.forEach(callback => callback());
  },
})); 