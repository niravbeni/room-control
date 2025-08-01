'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { useStore, RoomAction, RoomState } from '@/store/useStore';
import { useState, useEffect } from 'react';

export const Controller: React.FC = () => {
  const { emitRoomAction, emitRoomStateChange, isConnected } = useSocket();
  const { activeRoomState, isResetting, addResetCallback, removeResetCallback } = useStore();
  
  // Track which action buttons have been clicked
  const [clickedActions, setClickedActions] = useState<Set<string>>(new Set());

  // Register reset callback to clear clicked actions
  useEffect(() => {
    const resetCallback = () => {
      setClickedActions(new Set()); // Clear all clicked actions on reset
    };
    
    addResetCallback(resetCallback);
    
    return () => {
      removeResetCallback(resetCallback);
    };
  }, [addResetCallback, removeResetCallback]);

  const handleRoomAction = async (action: RoomAction) => {
    // Toggle the clicked state (on/off)
    setClickedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(action)) {
        newSet.delete(action); // Turn off if already on
      } else {
        newSet.add(action); // Turn on if off
      }
      return newSet;
    });
    
    // Emit socket event
    emitRoomAction(action);
    
    // Send to Zapier webhook only when turning ON
    if (!clickedActions.has(action)) {
      await sendToZapier(action);
    }
  };

  const sendToZapier = async (action: RoomAction) => {
    // Placeholder for Zapier webhook - API key to be added later
    const messages = {
      'tech-support': 'Tech support requested from room G08. Please send someone to resolve.',
      'room-refresh': 'Room refresh requested from room G08. Please prepare for cleaning.',
      'extend-booking': 'Booking extension requested for room G08. Please extend the reservation.',
      'coffee-lunch': 'Coffee/lunch order requested from room G08. Please coordinate delivery.'
    };

    const message = messages[action as keyof typeof messages];
    
    try {
      // TODO: Replace with actual Zapier webhook URL when API key is provided
      console.log('Zapier webhook would send:', { action, message, room: 'G08' });
      
      /*
      await fetch('ZAPIER_WEBHOOK_URL_HERE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message, room: 'G08' })
      });
      */
    } catch (error) {
      console.error('Failed to send to Zapier:', error);
    }
  };

  const handleRoomStateChange = (state: RoomState) => {
    // These change the display page
    emitRoomStateChange(state);
  };

  // Top 4 buttons (2x2 grid) - Room Actions with Zapier integration
  const roomActions = [
    { 
      id: 'tech-support' as RoomAction, 
      label: 'Tech Support', 
      subtitle: 'Request technical assistance',
      clickedLabel: 'Request Initiated',
      clickedSubtitle: 'Someone is coming to help you'
    },
    { 
      id: 'room-refresh' as RoomAction, 
      label: 'Room Refresh', 
      subtitle: 'Request room cleaning',
      clickedLabel: 'Refresh Requested',
      clickedSubtitle: 'Cleaning team has been notified'
    },
    { 
      id: 'extend-booking' as RoomAction, 
      label: 'Extend Booking', 
      subtitle: 'Extend room reservation',
      clickedLabel: 'Extension Requested',
      clickedSubtitle: 'Your booking is being extended'
    },
    { 
      id: 'coffee-lunch' as RoomAction, 
      label: 'Coffee/Lunch Order', 
      subtitle: 'Request food & beverages',
      clickedLabel: 'Order Placed',
      clickedSubtitle: 'Your order is being prepared'
    },
  ];

  // Bottom 4 buttons (1x4 grid) - Room State (change display)
  const roomStates = [
    { id: 'state1' as RoomState, label: 'Call Room Refresh', subtitle: 'Request room cleaning' },
    { id: 'state2' as RoomState, label: 'Wrapping Up', subtitle: 'Give us 5 more minutes' },
    { id: 'state3' as RoomState, label: 'Lunch Time', subtitle: 'Bring lunch in 15 mins' },
    { id: 'state4' as RoomState, label: 'Do Not Disturb', subtitle: 'Coffee order cancelled' },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden" style={{height: '100%', maxHeight: '100%'}}>
      {/* Content Area - ULTRA aggressive safe area padding for all devices */}
      <div className="flex-1 flex flex-col p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden mobile-safe-bottom ipad-safe-bottom desktop-safe-bottom mobile-content ios-ultra-safe ipad-ultra-safe" style={{height: '100%', maxHeight: '100%'}}>
        {/* TOP SECTION - 4 Room Action Cards in 2x2 Grid - BIGGER with hover effects */}
        <div className="flex-[2] overflow-visible" style={{minHeight: '0'}}>
          <div className="h-full grid grid-cols-2 gap-2 sm:gap-3 p-1" style={{height: 'calc(100% - 12px)'}}>
            {roomActions.map((action) => {
              const isClicked = clickedActions.has(action.id);
              return (
                <Card
                  key={action.id}
                  className={`h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] active:shadow-md border-0 shadow-lg overflow-hidden py-0 gap-0 ${
                    isClicked 
                      ? 'bg-[#CB1A84] hover:bg-[#CB1A84]/90' 
                      : 'bg-white hover:bg-gray-50 active:bg-gray-100'
                  } ${
                    !isConnected || isResetting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                  onClick={() => !(!isConnected || isResetting) && handleRoomAction(action.id)}
                >
                  <CardContent className="h-full flex flex-col items-center justify-center p-0 m-0 px-0 transition-all duration-200">
                    <div className={`text-center space-y-2 sm:space-y-3 p-3 sm:p-6 w-full h-full flex flex-col items-center justify-center transition-all duration-200 ${
                      isClicked ? 'text-white' : 'text-gray-800 hover:text-gray-900'
                    }`}>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                        {isClicked ? action.clickedLabel : action.label}
                      </h2>
                      <p className={`text-base sm:text-lg md:text-xl font-medium leading-tight ${
                        isClicked ? 'text-white/90' : 'text-gray-600 group-hover:text-gray-700'
                      }`}>
                        {isClicked ? action.clickedSubtitle : action.subtitle}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* BOTTOM SECTION - 4 Room State Cards in 1x4 Grid - SMALLER with EXTREME bottom space */}
        <div className="flex-[1] overflow-visible" style={{minHeight: '0'}}>
          <div className="h-full grid grid-cols-4 gap-2 sm:gap-3 p-1" style={{height: 'calc(100% - 56px)'}}>
            {roomStates.map((state) => (
              <Card
                key={state.id}
                className={`h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] border-0 shadow-lg overflow-hidden bg-white hover:bg-gray-100 py-0 gap-0 m-1 ${
                  activeRoomState === state.id 
                    ? 'ring-4 ring-[#CB1A84] shadow-2xl scale-105' 
                    : 'hover:shadow-2xl'
                } ${
                  !isConnected || isResetting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                onClick={() => !(!isConnected || isResetting) && handleRoomStateChange(state.id)}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-0 m-0 px-0">
                  <div className={`text-center space-y-1 sm:space-y-2 p-2 sm:p-4 w-full h-full flex flex-col items-center justify-center ${
                    activeRoomState === state.id ? 'text-[#CB1A84]' : 'text-gray-800'
                  }`}>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                      {state.label}
                    </h2>
                    <p className={`text-sm sm:text-base font-medium leading-tight ${
                      activeRoomState === state.id ? 'text-[#CB1A84]/80' : 'text-gray-600'
                    }`}>
                      {state.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 