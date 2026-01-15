'use client';

import dynamic from 'next/dynamic';
import * as React from 'react';
import MapControls, { City, Theme } from '../components/MapControls';

// Dynamic import with loading state
const ThreeDMap = dynamic(() => import('../components/ThreeDMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-white">Loading Map...</div>
});

// City Coordinates
const CITIES: Record<City, { center: [number, number]; zoom: number; pitch: number; bearing: number }> = {
  'UB': { center: [106.9177, 47.9184], zoom: 13, pitch: 60, bearing: 0 },
  'Tokyo': { center: [139.6917, 35.6895], zoom: 14, pitch: 60, bearing: -45 },
  'Paris': { center: [2.3522, 48.8566], zoom: 14, pitch: 60, bearing: 30 }
};

export default function Home() {
  const [theme, setTheme] = React.useState<Theme>('day');
  const [targetLoc, setTargetLoc] = React.useState<{
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  } | null>(null);

  // Handlers
  const handleFlyTo = (city: City) => {
    setTargetLoc(CITIES[city]);
  };

  const handleToggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleReset = () => {
    setTargetLoc(CITIES['UB']);
  };

  const mapStyle = theme === 'day'
    ? 'https://tiles.openfreemap.org/styles/bright'
    : 'https://tiles.openfreemap.org/styles/positron';

  return (
    <main className="relative w-full h-screen overflow-hidden">

      <MapControls
        onFlyTo={handleFlyTo}
        onToggleTheme={handleToggleTheme}
        onReset={handleReset}
        currentTheme={theme}
      />

      <div className="w-full h-full">
        <ThreeDMap
          mapStyle={mapStyle}
          targetLoc={targetLoc}
        />
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 right-1 pointer-events-none text-xs text-gray-500 z-50 px-2 py-1 bg-white/50 rounded">
        Map Data © OpenStreetMap | Tiles © OpenFreeMap
      </div>
    </main>
  );
}
