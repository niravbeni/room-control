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
      {/* Tab Navigation with Status */}
      <div className="bg-white border-b border-gray-200 flex-shrink-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            {/* Left: Reset Button (subtle) */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={!isConnected || isResetting}
                className="gap-2 text-gray-500 hover:text-gray-700 opacity-60 hover:opacity-100 cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                Reset
              </Button>
            </div>

            {/* Center: Tab Navigation */}
            <div className="flex space-x-6">
              <Button
                variant={activeTab === 'controller' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('controller')}
                className={`gap-2 cursor-pointer ${
                  activeTab === 'controller' 
                    ? 'bg-[var(--pink-accent)] hover:bg-[var(--pink-accent)]/90 text-white' 
                    : 'text-gray-700 hover:text-[var(--pink-accent)]'
                }`}
              >
                <Gamepad2 className="w-5 h-5" />
                Controller
              </Button>
              <Button
                variant={activeTab === 'display' ? 'default' : 'ghost'}
                size="lg"
                onClick={() => setActiveTab('display')}
                className={`gap-2 cursor-pointer ${
                  activeTab === 'display' 
                    ? 'bg-[var(--pink-accent)] hover:bg-[var(--pink-accent)]/90 text-white' 
                    : 'text-gray-700 hover:text-[var(--pink-accent)]'
                }`}
              >
                <Monitor className="w-5 h-5" />
                Display
              </Button>
            </div>

            {/* Right: Connection Status and Active State (subtle) */}
            <div className="flex items-center gap-3">
              {activeRoomState && (
                <Badge variant="outline" className="text-xs bg-[var(--pink-accent)]/10 text-[var(--pink-accent)] border-[var(--pink-accent)]/20">
                  {activeRoomState.replace('state', 'State ')}
                </Badge>
              )}
              
              {isConnected ? (
                <div className="flex items-center gap-1 opacity-60">
                  <Wifi className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-600">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 opacity-60">
                  <WifiOff className="w-3 h-3 text-red-500" />
                  <span className="text-xs text-red-600">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content - Takes remaining height exactly */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'controller' && <Controller />}
        {activeTab === 'display' && <Display />}
      </div>
    </div>
  );
}
