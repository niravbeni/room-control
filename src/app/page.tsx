'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Monitor, Tablet } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 h-full w-full gap-6">
        
        {/* Dashboard A */}
        <Card className="h-full w-full rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-center items-center p-6">
          <div className="flex items-center justify-center mb-4">
            <Monitor className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Dashboard A</h3>
          <p className="text-gray-600 mb-4 text-center">Room 139</p>
          <Link href="/dashboard-a">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer">
              Open Dashboard A
            </Button>
          </Link>
        </Card>

        {/* Dashboard B */}
        <Card className="h-full w-full rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-center items-center p-6">
          <div className="flex items-center justify-center mb-4">
            <Monitor className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Dashboard B</h3>
          <p className="text-gray-600 mb-4 text-center">Room 143</p>
          <Link href="/dashboard-b">
            <Button className="w-full bg-orange-600 hover:bg-orange-700 cursor-pointer">
              Open Dashboard B
            </Button>
          </Link>
        </Card>

        {/* Dashboard C */}
        <Card className="h-full w-full rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-center items-center p-6">
          <div className="flex items-center justify-center mb-4">
            <Monitor className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Dashboard C</h3>
          <p className="text-gray-600 mb-4 text-center">Room 150</p>
          <Link href="/dashboard-c">
            <Button className="w-full bg-green-600 hover:bg-green-700 cursor-pointer">
              Open Dashboard C
            </Button>
          </Link>
        </Card>

        {/* Catering Screen */}
        <Card className="h-full w-full rounded-2xl border-2 border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-center items-center p-6">
          <div className="flex items-center justify-center mb-4">
            <Tablet className="w-8 h-8 text-pink-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-center">Catering Screen</h3>
          <p className="text-gray-600 mb-4 text-center">Control Hub</p>
          <Link href="/catering">
            <Button className="w-full bg-pink-600 hover:bg-pink-700 cursor-pointer">
              Open Catering Screen
            </Button>
          </Link>
        </Card>

      </div>
    </div>
  );
}
