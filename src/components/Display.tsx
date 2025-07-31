'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { useStore } from '@/store/useStore';
import { Monitor } from 'lucide-react';

export const Display: React.FC = () => {
  const { activeRoomState } = useStore();

  const roomStateData = {
    state1: {
      title: 'Room State 1',
      subtitle: 'First Display Configuration',
      description: 'This is the full-screen display for Room State 1. Here you can show any information, status, or content related to this state.',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      accentColor: 'text-blue-600',
      badgeColor: 'bg-blue-500',
    },
    state2: {
      title: 'Room State 2',
      subtitle: 'Second Display Configuration',
      description: 'This is the full-screen display for Room State 2. You can customize this content to show different information for each state.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      accentColor: 'text-green-600',
      badgeColor: 'bg-green-500',
    },
    state3: {
      title: 'Room State 3',
      subtitle: 'Third Display Configuration',
      description: 'This is the full-screen display for Room State 3. Each state can have completely different layouts and content.',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      accentColor: 'text-purple-600',
      badgeColor: 'bg-purple-500',
    },
    state4: {
      title: 'Room State 4',
      subtitle: 'Fourth Display Configuration',
      description: 'This is the full-screen display for Room State 4. Perfect for showing different room configurations or status information.',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      accentColor: 'text-orange-600',
      badgeColor: 'bg-orange-500',
    },
  };

  // Default state when nothing is selected
  if (!activeRoomState) {
    return (
      <div className="h-full bg-gray-100 flex items-center justify-center p-6 overflow-hidden">
        <div className="text-center space-y-6 max-w-2xl">
          <Monitor className="w-24 h-24 text-gray-400 mx-auto" />
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-gray-700">Waiting for Selection</h1>
            <p className="text-xl text-gray-500 leading-relaxed">Press a Room State button on the Controller to display content here</p>
          </div>
        </div>
      </div>
    );
  }

  const currentState = roomStateData[activeRoomState];

  return (
    <div className={`h-full ${currentState.bgColor} flex items-center justify-center p-4 overflow-hidden`}>
      {/* Full-screen centered content */}
      <Card className={`w-full max-w-5xl h-full max-h-full ${currentState.borderColor} border-4 shadow-2xl overflow-hidden flex flex-col`}>
        <CardHeader className="text-center py-6 bg-white/50 flex-shrink-0">
          <CardTitle className={`text-5xl font-bold ${currentState.accentColor} mb-3`}>
            {currentState.title}
          </CardTitle>
          <p className="text-xl text-gray-600 font-medium">
            {currentState.subtitle}
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center py-6 space-y-6 min-h-0">
          <div className="text-center max-w-3xl">
            <p className="text-lg text-gray-700 leading-relaxed">
              {currentState.description}
            </p>
          </div>
          
          {/* Large visual indicator */}
          <div className={`w-28 h-28 rounded-full ${currentState.bgColor} ${currentState.borderColor} border-8 flex items-center justify-center animate-pulse shadow-xl flex-shrink-0`}>
            <span className={`text-4xl font-bold ${currentState.accentColor}`}>
              {activeRoomState.replace('state', '')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 