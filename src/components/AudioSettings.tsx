'use client';

import { useState } from 'react';
import { useAudio } from '@/hooks/useAudio';

export const AudioSettings: React.FC = () => {
  const { isEnabled, volume, setAudioEnabled, setVolume } = useAudio();
  const [localVolume, setLocalVolume] = useState(volume * 100); // Convert to percentage (should be 100% by default)

  const handleVolumeChange = (newVolume: number) => {
    setLocalVolume(newVolume);
    setVolume(newVolume / 100); // Convert back to 0-1 range
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border">
      <h3 className="text-lg font-semibold mb-4">🔊 Audio Settings</h3>
      
      {/* Audio Enable/Disable */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">Enable Sound Effects</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setAudioEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Volume Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Volume</span>
          <span className="text-sm text-gray-500">{Math.round(localVolume)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={localVolume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          disabled={!isEnabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Test Sound Button - Disabled */}
      <button
        disabled={true}
        className="w-full bg-gray-400 cursor-not-allowed text-white py-2 px-4 rounded-lg font-medium"
      >
        🎵 Test Sound (Disabled)
      </button>

      {/* Sound Info */}
      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Room Alerts:</strong> Sound notifications for Room 121</p>
        <p><strong>Note:</strong> Sounds only play on catering screen, dashboards are silent</p>
      </div>
    </div>
  );
};
