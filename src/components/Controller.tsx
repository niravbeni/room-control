'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { useStore, RoomAction, RoomState } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { Edit, Wrench, Sparkles, Clock, Coffee } from 'lucide-react';

export const Controller: React.FC = () => {
  const { emitRoomAction, emitRoomStateChange, emitCustomMessage, isConnected } = useSocket();
  const { activeRoomState, customMessage, isResetting, addResetCallback, removeResetCallback, setCustomMessage, setCalculatedTime } = useStore();
  
  // Track which action buttons have been clicked
  const [clickedActions, setClickedActions] = useState<Set<string>>(new Set());
  
  // Custom message input state
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputText, setCustomInputText] = useState('');

  // Register reset callback to clear clicked actions
  useEffect(() => {
    const resetCallback = () => {
      setClickedActions(new Set()); // Clear all clicked actions on reset
      setShowCustomInput(false); // Close custom input
      setCustomInputText(''); // Clear input text
    };
    
    addResetCallback(resetCallback);
    
    return () => {
      removeResetCallback(resetCallback);
    };
  }, [addResetCallback, removeResetCallback]);

  // Helper function to format time nicely (e.g., "2:15pm")
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).toLowerCase();
  };

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
    const messages = {
      'tech-support': 'Tech support requested from room G08. Please send someone to resolve.',
      'room-refresh': 'Room refresh requested from room G08. Please prepare for cleaning.',
      'extend-booking': 'Booking extension requested for room G08. Please extend the reservation.',
      'coffee-lunch': 'Coffee/lunch order requested from room G08. Please coordinate delivery.'
    };

    const actionNames = {
      'tech-support': 'Tech Support',
      'room-refresh': 'Room Refresh',
      'extend-booking': 'Extend Booking',
      'coffee-lunch': 'Coffee/Lunch Order'
    };

    const message = messages[action as keyof typeof messages];
    const actionName = actionNames[action as keyof typeof actionNames];
    
    const payload = {
      action: actionName,
      actionId: action,
      message: message,
      room: 'G08',
      timestamp: new Date().toISOString(),
      type: 'room-action'
    };
    
    try {
      const response = await fetch('/api/zapier-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Successfully sent room action to Zapier:', payload);
        console.log('Zapier response:', result.zapierResponse);
      } else {
        console.error('Failed to send to Zapier:', response.status, result);
      }
    } catch (error) {
      console.error('Failed to send room action to Zapier:', error);
    }
  };



  const sendRoomStateToZapier = async (state: RoomState) => {
    // Get current calculated time from store
    const { calculatedTime } = useStore.getState();
    
    // Room state data matching what's in Display component
    const roomStateData = {
      state1: {
        title: 'Room Refresh Requested',
        message: 'Ready for Room Refresh',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        accentColor: 'text-blue-600',
      },
      state2: {
        title: 'Wrapping Up Meeting',
        message: 'Wrapping up. Please give us 5 more mins.',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        accentColor: 'text-green-600',
      },
      state3: {
        title: 'Lunch Break Time',
        message: calculatedTime 
          ? `Can you bring the order at ${calculatedTime}?`
          : 'Can you bring the order at 2:15pm?',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        accentColor: 'text-purple-600',
      },
      state4: {
        title: 'Do Not Disturb',
        message: 'Cancel the coffee order. Do not Disturb.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        accentColor: 'text-orange-600',
      },
    };

    const stateData = roomStateData[state as keyof typeof roomStateData];
    
    if (!stateData) return;

    const payload = {
      state: state,
      title: stateData.title,
      message: stateData.message,
      room: 'G08',
      timestamp: new Date().toISOString(),
      bgColor: stateData.bgColor,
      borderColor: stateData.borderColor,
      accentColor: stateData.accentColor,
      type: 'room-state',
      calculatedTime: calculatedTime || null // Include calculated time if available
    };
    
    try {
      const response = await fetch('/api/zapier-webhook', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Successfully sent room state to Zapier:', payload);
        console.log('Zapier response:', result.zapierResponse);
      } else {
        console.error('Failed to send room state to Zapier:', response.status, result);
      }
    } catch (error) {
      console.error('Failed to send room state to Zapier:', error);
    }
  };

  const handleRoomStateChange = async (state: RoomState) => {
    // Calculate time for state3 (Lunch Time) - 15 minutes from now
    if (state === 'state3') {
      const currentTime = new Date();
      const futureTime = new Date(currentTime.getTime() + 15 * 60 * 1000); // Add 15 minutes
      const formattedTime = formatTime(futureTime);
      setCalculatedTime(formattedTime);
    } else {
      setCalculatedTime(null); // Clear calculated time for other states
    }

    // These change the display page
    emitRoomStateChange(state);
    
    // Send to Zapier webhook for the 4 main room states (to the new webhook)
    if (state && ['state1', 'state2', 'state3', 'state4'].includes(state)) {
      await sendRoomStateToZapier(state);
    }
  };

  const handleCustomMessageSelect = () => {
    // Main button click - select/deselect the custom message state
    if (activeRoomState === 'custom') {
      // If already showing custom message, toggle off
      handleRoomStateChange(null);
    } else if (customMessage) {
      // If there's a message, show it
      handleRoomStateChange('custom');
    } else {
      // No message exists, open editor to create one
      handleCustomMessageEdit();
    }
  };

  const handleCustomMessageEdit = (e?: React.MouseEvent) => {
    // Stop event propagation to prevent triggering the main button
    if (e) {
      e.stopPropagation();
    }
    
    // Show input for custom message
    setShowCustomInput(true);
    setCustomInputText(customMessage); // Pre-fill with existing message
  };

  const submitCustomMessage = () => {
    if (customInputText.trim()) {
      setCustomMessage(customInputText.trim());
      emitCustomMessage(customInputText.trim());
      handleRoomStateChange('custom');
    }
    setShowCustomInput(false);
  };

  const cancelCustomMessage = () => {
    setShowCustomInput(false);
    setCustomInputText('');
  };

  // Top 4 buttons (2x2 grid) - Room Actions with Zapier integration
  const roomActions = [
    { 
      id: 'tech-support' as RoomAction, 
      label: 'Tech Support', 
      subtitle: 'Request technical assistance',
      clickedLabel: 'Request Initiated',
      clickedSubtitle: 'Someone is coming to help you',
      icon: Wrench
    },
    { 
      id: 'room-refresh' as RoomAction, 
      label: 'Room Refresh', 
      subtitle: 'Request room cleaning',
      clickedLabel: 'Refresh Requested',
      clickedSubtitle: 'Cleaning team has been notified',
      icon: Sparkles
    },
    { 
      id: 'extend-booking' as RoomAction, 
      label: 'Extend Booking', 
      subtitle: 'Extend room reservation',
      clickedLabel: 'Extension Requested',
      clickedSubtitle: 'Your booking is being extended',
      icon: Clock
    },
    { 
      id: 'coffee-lunch' as RoomAction, 
      label: 'Coffee/Lunch Order', 
      subtitle: 'Request food & beverages',
      clickedLabel: 'Order Placed',
      clickedSubtitle: 'Your order is being prepared',
      icon: Coffee
    },
  ];

  // Bottom 5 buttons (1x5 grid) - Room State (change display) + Custom Message
  const roomStates = [
    { id: 'state1' as RoomState, label: 'Call Room Refresh', subtitle: 'Request room cleaning' },
    { id: 'state2' as RoomState, label: 'Wrapping Up', subtitle: 'Give us 5 more minutes' },
    { id: 'state3' as RoomState, label: 'Lunch Time', subtitle: 'Bring lunch in 15 mins' },
    { id: 'state4' as RoomState, label: 'Do Not Disturb', subtitle: 'Coffee order cancelled' },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden" style={{height: '100%', maxHeight: '100%'}}>
      {/* Content Area - ULTRA aggressive safe area padding for all devices */}
      <div className="flex-1 flex flex-col p-1 sm:p-2 md:p-3 gap-1 sm:gap-2 md:gap-3 overflow-hidden mobile-safe-bottom ipad-safe-bottom desktop-safe-bottom mobile-content ios-ultra-safe ipad-ultra-safe" style={{height: '100%', maxHeight: '100%'}}>
        
        {/* ROOM CONTROLS HEADING */}
        <div className="text-left py-1 px-1 sm:px-2">
          <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-700">Request Assistance : <span className="text-sm sm:text-lg md:text-xl font-normal text-gray-500">Get help from building staff</span></h2>
        </div>

        {/* TOP SECTION - 4 Room Action Cards in 2x2 Grid - BIGGER with hover effects */}
        <div className="flex-[2] overflow-visible" style={{minHeight: '0'}}>
          <div className="h-full grid grid-cols-2 gap-1 sm:gap-2 md:gap-3 p-1" style={{height: 'calc(100% - 12px)'}}>
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
                  <CardContent className="h-full flex flex-col p-0 m-0 px-0 transition-all duration-200 relative">
                    {/* Icon in top left corner */}
                    <div className="absolute top-2 left-2 z-10">
                      <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 ${
                        isClicked ? 'text-white/80' : 'text-gray-500'
                      }`} />
                    </div>
                    
                    {/* Centered content */}
                    <div className={`text-center space-y-1 sm:space-y-2 md:space-y-3 p-2 sm:p-4 md:p-6 w-full h-full flex flex-col items-center justify-center transition-all duration-200 ${
                      isClicked ? 'text-white' : 'text-gray-800 hover:text-gray-900'
                    }`}>
                      <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                        {isClicked ? action.clickedLabel : action.label}
                      </h2>
                      <p className={`text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-tight ${
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

        {/* OUTSIDE DISPLAY HEADING */}
        <div className="text-left py-1 px-1 sm:px-2">
          <h2 className="text-sm sm:text-lg md:text-xl font-bold text-gray-700">Display Messages : <span className="text-sm sm:text-lg md:text-xl font-normal text-gray-500">Show your status to people outside</span></h2>
        </div>

        {/* BOTTOM SECTION - 5 Room State Cards in 1x5 Grid - SMALLER with EXTREME bottom space */}
        <div className="flex-[1] overflow-visible" style={{minHeight: '0'}}>
          <div className="h-full grid grid-cols-5 gap-1 sm:gap-2 p-1" style={{height: 'calc(100% - 40px)'}}>
            {roomStates.map((state) => (
              <Card
                key={state.id}
                className={`h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] border-0 shadow-lg overflow-hidden bg-white hover:bg-gray-100 py-0 gap-0 ${
                  activeRoomState === state.id 
                    ? 'ring-2 sm:ring-4 ring-[#CB1A84] shadow-2xl scale-105' 
                    : 'hover:shadow-2xl'
                } ${
                  !isConnected || isResetting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                onClick={() => !(!isConnected || isResetting) && handleRoomStateChange(state.id)}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-0 m-0 px-0">
                  <div className={`text-center space-y-1 p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center ${
                    activeRoomState === state.id ? 'text-[#CB1A84]' : 'text-gray-800'
                  }`}>
                    <h2 className="text-sm sm:text-base md:text-lg font-bold leading-tight">
                      {state.label}
                    </h2>
                    <p className={`text-xs sm:text-sm font-medium leading-tight ${
                      activeRoomState === state.id ? 'text-[#CB1A84]/80' : 'text-gray-600'
                    }`}>
                      {state.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Custom Message Button - 5th button with edit icon */}
            <Card
              className={`h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] border-0 shadow-lg overflow-hidden bg-white hover:bg-gray-100 py-0 gap-0 relative ${
                activeRoomState === 'custom' 
                  ? 'ring-2 sm:ring-4 ring-[#CB1A84] shadow-2xl scale-105' 
                  : 'hover:shadow-2xl'
              } ${
                !isConnected || isResetting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={() => !(!isConnected || isResetting) && handleCustomMessageSelect()}
            >
              {/* Edit icon in bottom-right corner - smaller on mobile */}
              <button
                className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-10 p-1 sm:p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 opacity-70 hover:opacity-100 flex items-center justify-center"
                onClick={(e) => !(!isConnected || isResetting) && handleCustomMessageEdit(e)}
                style={{ minWidth: '24px', minHeight: '24px' }}
                aria-label="Edit custom message"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
              </button>

              <CardContent className="h-full flex flex-col items-center justify-center p-0 m-0 px-0">
                <div className={`text-center space-y-1 p-1 sm:p-2 w-full h-full flex flex-col items-center justify-center ${
                  activeRoomState === 'custom' ? 'text-[#CB1A84]' : 'text-gray-800'
                }`}>
                  {customMessage ? (
                    <>
                      <h2 className="text-xs sm:text-sm md:text-base font-bold leading-tight">
                        Custom Message
                      </h2>
                      <p className={`text-xs sm:text-sm font-medium leading-tight ${
                        activeRoomState === 'custom' ? 'text-[#CB1A84]/80' : 'text-gray-600'
                      }`}>
                        {customMessage.length > 50 ? `${customMessage.substring(0, 50)}...` : customMessage}
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-sm sm:text-base md:text-lg font-bold leading-tight">
                        Custom Message
                      </h2>
                      <p className={`text-xs sm:text-sm font-medium leading-tight ${
                        activeRoomState === 'custom' ? 'text-[#CB1A84]/80' : 'text-gray-600'
                      }`}>
                        Add message
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom Message Input Modal */}
      {showCustomInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Custom Display Message</h3>
            <textarea
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="Enter your custom message for the display screen..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#CB1A84] focus:border-transparent"
              maxLength={200}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={submitCustomMessage}
                disabled={!customInputText.trim()}
                className="flex-1 bg-[#CB1A84] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#CB1A84]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Display Message
              </button>
              <button
                onClick={cancelCustomMessage}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 