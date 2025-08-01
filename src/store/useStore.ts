import { create } from 'zustand';

export type RoomAction = 'makesupport' | 'room-refresh' | 'extend-booking' | 'coffee-lunch';
export type RoomState = 'state1' | 'state2' | 'state3' | 'state4' | 'custom' | null;

interface RoomStore {
  activeRoomState: RoomState;
  customMessage: string; // Add custom message storage
  calculatedTime: string | null; // Add calculated time for dynamic messages
  isConnected: boolean;
  isResetting: boolean;
  resetCallbacks: Array<() => void>; // Add callback system for reset
  setActiveRoomState: (state: RoomState) => void;
  setCustomMessage: (message: string) => void; // Add custom message setter
  setCalculatedTime: (time: string | null) => void; // Add calculated time setter
  setIsConnected: (connected: boolean) => void;
  setIsResetting: (resetting: boolean) => void;
  addResetCallback: (callback: () => void) => void;
  removeResetCallback: (callback: () => void) => void;
  triggerReset: () => void;
}

export const useStore = create<RoomStore>((set, get) => ({
  activeRoomState: null,
  customMessage: '', // Initialize custom message
  calculatedTime: null, // Initialize calculated time
  isConnected: false,
  isResetting: false,
  resetCallbacks: [],
  
  setActiveRoomState: (state) => set({ activeRoomState: state }),
  setCustomMessage: (message) => set({ customMessage: message }), // Add custom message setter
  setCalculatedTime: (time) => set({ calculatedTime: time }), // Add calculated time setter
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsResetting: (resetting) => set({ isResetting: resetting }),
  
  addResetCallback: (callback) => set((state) => ({
    resetCallbacks: [...state.resetCallbacks, callback]
  })),
  
  removeResetCallback: (callback) => set((state) => ({
    resetCallbacks: state.resetCallbacks.filter(cb => cb !== callback)
  })),
  
  triggerReset: () => {
    // Reset the main state including custom message and calculated time
    set({ activeRoomState: null, customMessage: '', calculatedTime: null, isResetting: false });
    // Trigger all registered callbacks
    const { resetCallbacks } = get();
    resetCallbacks.forEach(callback => callback());
  },
})); 