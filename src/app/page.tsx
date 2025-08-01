'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Controller } from '@/components/Controller';
import { Display } from '@/components/Display';
import { useSocket } from '@/hooks/useSocket';
import { useStore } from '@/store/useStore';
import { Monitor, Gamepad2, Wifi, WifiOff, RotateCcw } from 'lucide-react';

export default function RoomControl() {
  const [activeTab, setActiveTab] = useState<'controller' | 'display'>('controller');
  
  // Initialize socket connection and get status
  const { isConnected, emitReset } = useSocket();
  const { activeRoomState, isResetting, triggerReset, setIsResetting } = useStore();

  const handleReset = () => {
    setIsResetting(true);
    emitReset();
    triggerReset(); // This will clear both room state and clicked actions
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden" style={{height: '100vh', maxHeight: '100vh'}}>
      {/* Tab Navigation with Status - Smaller fixed height */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm" style={{height: '56px', minHeight: '56px', maxHeight: '56px'}}>
        <div className="max-w-7xl mx-auto px-0 h-full">
          <div className="flex items-center justify-between py-1 sm:py-2 h-full">
            {/* Left: Reset Button (subtle) - Hugging left edge */}
            <div className="flex items-center pl-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={!isConnected || isResetting}
                className="gap-1 text-gray-500 hover:text-gray-700 opacity-80 hover:opacity-100 cursor-pointer text-xs"
              >
                <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-xs">Reset</span>
              </Button>
            </div>

            {/* Center: Tab Navigation - Fixed positioning */}
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'controller' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('controller')}
                className={`gap-2 cursor-pointer text-sm sm:text-base px-3 sm:px-4 py-2 ${
                  activeTab === 'controller' 
                    ? 'bg-[var(--pink-accent)] hover:bg-[var(--pink-accent)]/90 text-white' 
                    : 'text-gray-700 hover:text-[var(--pink-accent)]'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="font-semibold">Controller</span>
              </Button>
              <Button
                variant={activeTab === 'display' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('display')}
                className={`gap-2 cursor-pointer text-sm sm:text-base px-3 sm:px-4 py-2 ${
                  activeTab === 'display' 
                    ? 'bg-[var(--pink-accent)] hover:bg-[var(--pink-accent)]/90 text-white' 
                    : 'text-gray-700 hover:text-[var(--pink-accent)]'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="font-semibold">Display</span>
              </Button>
            </div>

            {/* Right: Connection Status and Active State (subtle) - Hugging right edge */}
            <div className="flex items-center gap-1 sm:gap-2 pr-2">
              {activeRoomState && (
                <Badge variant="outline" className="text-xs bg-[var(--pink-accent)]/10 text-[var(--pink-accent)] border-[var(--pink-accent)]/20 hidden md:inline-flex">
                  S{activeRoomState.replace('state', '')}
                </Badge>
              )}
              
              {isConnected ? (
                <div className="flex items-center gap-1 opacity-80">
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600 hidden lg:inline">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-80">
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600 hidden lg:inline">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content - More space for content */}
      <div className="flex-1 overflow-hidden" style={{height: 'calc(100vh - 56px)', maxHeight: 'calc(100vh - 56px)', minHeight: 'calc(100vh - 56px)'}}>
        {activeTab === 'controller' && <Controller />}
        {activeTab === 'display' && <Display />}
      </div>
    </div>
  );
}
