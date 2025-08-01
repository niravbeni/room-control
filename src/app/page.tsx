'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Controller } from '@/components/Controller';
import { Display } from '@/components/Display';
import { useSocket } from '@/hooks/useSocket';
import { useStore } from '@/store/useStore';
import { Monitor, Gamepad2, Wifi, WifiOff, RotateCcw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'controller' | 'display'>('controller');
  
  // Initialize socket connection and get status
  const { isConnected, emitReset } = useSocket();
  const { activeRoomState, isResetting } = useStore();

  const handleReset = () => {
    emitReset();
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Tab Navigation with Status - Fixed height to prevent shifting */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-2 sm:py-3 min-h-[60px]">
            {/* Left: Reset Button (subtle) - Fixed width */}
            <div className="flex items-center w-20 sm:w-24">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={!isConnected || isResetting}
                className="gap-1 sm:gap-2 text-gray-500 hover:text-gray-700 opacity-60 hover:opacity-100 cursor-pointer text-xs sm:text-sm"
              >
                <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>

            {/* Center: Tab Navigation - Fixed positioning */}
            <div className="flex space-x-2 sm:space-x-4">
              <Button
                variant={activeTab === 'controller' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('controller')}
                className={`gap-2 cursor-pointer text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 ${
                  activeTab === 'controller' 
                    ? 'bg-[var(--pink-accent)] hover:bg-[var(--pink-accent)]/90 text-white' 
                    : 'text-gray-700 hover:text-[var(--pink-accent)]'
                }`}
              >
                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">Controller</span>
              </Button>
              <Button
                variant={activeTab === 'display' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('display')}
                className={`gap-2 cursor-pointer text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 ${
                  activeTab === 'display' 
                    ? 'bg-[var(--pink-accent)] hover:bg-[var(--pink-accent)]/90 text-white' 
                    : 'text-gray-700 hover:text-[var(--pink-accent)]'
                }`}
              >
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-semibold">Display</span>
              </Button>
            </div>

            {/* Right: Connection Status and Active State (subtle) - Fixed width */}
            <div className="flex items-center gap-1 sm:gap-3 w-20 sm:w-32 justify-end">
              {activeRoomState && (
                <Badge variant="outline" className="text-xs bg-[var(--pink-accent)]/10 text-[var(--pink-accent)] border-[var(--pink-accent)]/20 hidden sm:inline-flex">
                  {activeRoomState.replace('state', 'State ')}
                </Badge>
              )}
              
              {isConnected ? (
                <div className="flex items-center gap-1 opacity-60">
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 hidden sm:inline">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-60">
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600 hidden sm:inline">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content - iOS Safari safe area handling */}
      <div className="flex-1 min-h-0 overflow-hidden" style={{height: 'calc(100vh - 60px)', minHeight: 'calc(100vh - 60px)'}}>
        {activeTab === 'controller' && <Controller />}
        {activeTab === 'display' && <Display />}
      </div>
    </div>
  );
}
