'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { useStore, RoomAction, RoomState } from '@/store/useStore';

export const Controller: React.FC = () => {
  const { emitRoomAction, emitRoomStateChange, isConnected } = useSocket();
  const { activeRoomState, isResetting } = useStore();

  const handleRoomAction = (action: RoomAction) => {
    // These do nothing for now as requested
    emitRoomAction(action);
  };

  const handleRoomStateChange = (state: RoomState) => {
    // These change the display page
    emitRoomStateChange(state);
  };

  // Top 4 buttons (2x2 grid) - Room Actions (do nothing for now)
  const roomActions = [
    { id: 'action1' as RoomAction, label: 'Room Action 1', subtitle: 'General Control' },
    { id: 'action2' as RoomAction, label: 'Room Action 2', subtitle: 'System Control' },
    { id: 'action3' as RoomAction, label: 'Room Action 3', subtitle: 'Device Control' },
    { id: 'action4' as RoomAction, label: 'Room Action 4', subtitle: 'Environment Control' },
  ];

  // Bottom 4 buttons (1x4 grid) - Room State (change display)
  const roomStates = [
    { id: 'state1' as RoomState, label: 'State 1', subtitle: 'Blue Display' },
    { id: 'state2' as RoomState, label: 'State 2', subtitle: 'Green Display' },
    { id: 'state3' as RoomState, label: 'State 3', subtitle: 'Purple Display' },
    { id: 'state4' as RoomState, label: 'State 4', subtitle: 'Orange Display' },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden" style={{height: '100%', maxHeight: '100%'}}>
      {/* Content Area - Account for selection rings and prevent bottom clipping */}
      <div className="flex-1 flex flex-col p-2 sm:p-3 gap-2 sm:gap-3 overflow-hidden" style={{height: '100%', maxHeight: '100%', paddingBottom: '16px'}}>
        {/* TOP SECTION - 4 Room Action Cards in 2x2 Grid - BIGGER */}
        <div className="flex-[2] overflow-visible" style={{minHeight: '0'}}>
          <div className="h-full grid grid-cols-2 gap-2 sm:gap-3 p-1" style={{height: 'calc(100% - 8px)'}}>
            {roomActions.map((action) => (
              <Card
                key={action.id}
                className={`h-full cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl border-0 shadow-lg overflow-hidden bg-white hover:bg-gray-100 py-0 gap-0 ${
                  !isConnected || isResetting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                onClick={() => !(!isConnected || isResetting) && handleRoomAction(action.id)}
              >
                <CardContent className="h-full flex flex-col items-center justify-center p-0 m-0 px-0">
                  <div className="text-center space-y-2 sm:space-y-3 p-3 sm:p-6 text-gray-800 w-full h-full flex flex-col items-center justify-center">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
                      {action.label}
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl font-medium text-gray-600 leading-tight">
                      {action.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* BOTTOM SECTION - 4 Room State Cards in 1x4 Grid - SMALLER with ring space */}
        <div className="flex-[1] overflow-visible" style={{minHeight: '0'}}>
          <div className="h-full grid grid-cols-4 gap-2 sm:gap-3 p-1" style={{height: 'calc(100% - 24px)'}}>
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