'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Monitor, Tablet, Volume2 } from 'lucide-react';
import { AudioSettings } from '@/components/AudioSettings';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 to-pink-50 p-4 py-8 ipad-ultra-safe">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-h-[calc(100vh-8rem)] w-full gap-4">
        
        {/* Dashboard A */}
        <Card className="h-full w-full rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-center items-center p-4">
          <div className="flex items-center justify-center mb-3">
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Dashboard A</h3>
          <p className="text-gray-600 mb-3 text-center">Room 121</p>
          <Link href="/dashboard-a">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
              Open Dashboard A
              </Button>
          </Link>
        </Card>

        {/* Dashboard B */}
        <Card className="h-full w-full rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-center items-center p-4">
          <div className="flex items-center justify-center mb-3">
            <Monitor className="w-8 h-8 text-orange-600" />
            </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Dashboard B</h3>
          <p className="text-gray-600 mb-3 text-center">Room 130</p>
          <Link href="/dashboard-b">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
              Open Dashboard B
              </Button>
          </Link>
        </Card>



        {/* Catering Screen */}
        <Card className="h-full w-full rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-center items-center p-4">
          <div className="flex items-center justify-center mb-3">
            <Tablet className="w-8 h-8 text-pink-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Catering Screen</h3>
          <p className="text-gray-600 mb-3 text-center">Control Hub</p>
          <Link href="/catering">
            <Button className="w-full bg-pink-600 hover:bg-pink-700 cursor-pointer">
              Open Catering Screen
            </Button>
          </Link>
        </Card>

      </div>

      {/* Audio Settings Panel */}
      <div className="mt-8 max-w-md mx-auto">
        <AudioSettings />
      </div>
    </div>
  );
}
