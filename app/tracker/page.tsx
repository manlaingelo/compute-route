'use client';

import dynamic from 'next/dynamic';
import { useDeviceLocation } from '../../hooks/useDeviceLocation';

// Dynamic import for RouteMap to ensure no SSR issues with Leaflet
const RouteMap = dynamic(() => import('../../components/RouteMap'), { ssr: false });

export default function Home() {
    const { position, route } = useDeviceLocation(6000); // Update every 1s

    return (
        <main className="flex min-h-screen flex-col items-center justify-between relative">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex absolute top-4 left-4 p-4 pointer-events-none">
                <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 pointer-events-auto">
                    <code className="font-mono font-bold">
                        Realtime Device Tracking
                    </code>
                    <div className="ml-4">
                        Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
                    </div>
                </div>
            </div>

            <div className="w-full h-screen">
                <RouteMap
                    center={[47.917500, 106.920000]}
                    zoom={14}
                    position={position}
                    route={route}
                />
            </div>
        </main>
    );
}