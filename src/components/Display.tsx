'use client';

import { useStore } from '@/store/useStore';

export const Display: React.FC = () => {
  const { activeRoomState, customMessage, calculatedTime } = useStore();

  const roomStateData = {
    state1: {
      title: 'Room Refresh Requested',
      message: 'Ready for Room Refresh.',
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

  // Default state when nothing is selected
  if (!activeRoomState) {
    return (
      <div className="h-full bg-gray-400 flex items-center justify-center p-8 overflow-hidden" style={{height: '100%', maxHeight: '100%'}}>
        <div className="text-center max-w-4xl w-full">
          <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-bold leading-tight">
            Waiting for Selection
          </p>
        </div>
      </div>
    );
  }

    // Handle custom message display
  if (activeRoomState === 'custom') {
    return (
      <div className="h-full bg-gray-500 flex items-center justify-center p-8 overflow-hidden" style={{height: '100%', maxHeight: '100%'}}>
        {/* Simple centered text - no cards, no borders */}
        <div className="text-center max-w-4xl w-full">
          <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-bold leading-tight break-words hyphens-auto overflow-wrap-anywhere">
            {customMessage || 'No custom message set'}
          </p>
        </div>
      </div>
    );
  }

  const currentState = roomStateData[activeRoomState];

  // Map to actual CSS background colors instead of Tailwind classes
  const backgroundColors = {
    'bg-blue-50': 'bg-green-500',
    'bg-green-50': 'bg-red-500', 
    'bg-purple-50': 'bg-yellow-500',
    'bg-orange-50': 'bg-blue-500'
  };

  const bgColor = backgroundColors[currentState.bgColor as keyof typeof backgroundColors] || 'bg-gray-500';

  return (
    <div className={`h-full ${bgColor} flex items-center justify-center p-8 overflow-hidden`} style={{height: '100%', maxHeight: '100%'}}>
      {/* Simple centered text - no cards, no borders */}
      <div className="text-center max-w-4xl w-full">
        <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white font-bold leading-tight break-words hyphens-auto overflow-wrap-anywhere">
          {currentState.message}
        </p>
      </div>
    </div>
  );
}; 