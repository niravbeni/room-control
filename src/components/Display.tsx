'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { useStore } from '@/store/useStore';
import { Monitor } from 'lucide-react';

export const Display: React.FC = () => {
  // Ensure connection state is properly synchronized
  const { isConnected } = useSocket();
  const { activeRoomState } = useStore();

  const roomStateData = {
    state1: {
      title: 'Room Refresh Requested',
      message: 'A room cleaning has been requested. The cleaning team will arrive shortly to refresh this space.',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      accentColor: 'text-blue-600',
    },
    state2: {
      title: 'Wrapping Up Meeting',
      message: 'We are finishing up our session. Please give us 5 more minutes to conclude and gather our materials.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      accentColor: 'text-green-600',
    },
    state3: {
      title: 'Lunch Break Time',
      message: 'We are taking a lunch break. Please bring our lunch order in 15 minutes. Thank you!',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      accentColor: 'text-purple-600',
    },
    state4: {
      title: 'Do Not Disturb',
      message: 'Coffee order has been cancelled. Please do not disturb our meeting. We are in an important session.',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      accentColor: 'text-orange-600',
    },
  };

  // Default state when nothing is selected
  if (!activeRoomState) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden mobile-safe-bottom ipad-safe-bottom desktop-safe-bottom mobile-content ios-ultra-safe ipad-ultra-safe" style={{height: '100%', maxHeight: '100%'}}>
        <div className="text-center space-y-4 sm:space-y-6 max-w-2xl">
          <Monitor className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-400 mx-auto" />
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-700 leading-tight">Waiting for Selection</h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-tight sm:leading-relaxed">Press a Room State button on the Controller to display content here</p>
          </div>
        </div>
      </div>
    );
  }

  const currentState = roomStateData[activeRoomState];

  return (
    <div className={`h-full ${currentState.bgColor} flex items-center justify-center p-2 sm:p-3 overflow-hidden mobile-safe-bottom ipad-safe-bottom desktop-safe-bottom mobile-content ios-ultra-safe ipad-ultra-safe`} style={{height: '100%', maxHeight: '100%'}}>
      {/* Full-screen centered content with EXTREME bottom clearance */}
      <Card className={`w-full max-w-5xl ${currentState.borderColor} border-4 shadow-2xl overflow-hidden flex flex-col`} style={{height: 'calc(100% - 56px)', maxHeight: 'calc(100% - 56px)'}}>
        <CardHeader className="text-center py-6 sm:py-8 bg-white/50 flex-shrink-0">
          <CardTitle className={`text-4xl sm:text-5xl md:text-6xl font-bold ${currentState.accentColor} mb-4 sm:mb-6 leading-tight`}>
            {currentState.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-6 sm:px-12 min-h-0 overflow-hidden">
          {/* Large text message filling most of the card */}
          <div className="text-center max-w-4xl">
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-700 leading-relaxed font-medium">
              {currentState.message}
            </p>
          </div>
          
          {/* Remove the number indicator completely */}
        </CardContent>
      </Card>
    </div>
  );
}; 