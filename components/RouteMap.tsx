'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Custom Car Icon
const carIcon = L.divIcon({
    className: 'custom-car-icon',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="width: 100%; height: 100%; fill: #2563eb; stroke: white; stroke-width: 20px;">
        <path d="M135.2 117.4L109.1 192H402.9l-26.1-74.6C372.3 104.6 360.2 96 346.6 96H165.4c-13.6 0-25.7 8.6-30.2 21.4zM39.6 196.8L74.8 96.3C88.3 57.8 124.6 32 165.4 32H346.6c40.8 0 77.1 25.8 90.6 64.3l35.2 100.5c23.2 9.6 39.6 32.5 39.6 59.2V400c0 26.5-21.5 48-48 48H448c-8.8 0-16-7.2-16-16V400H80v32c0 8.8-7.2 16-16 16H48c-26.5 0-48-21.5-48-48V256c0-26.7 16.4-49.6 39.6-59.2zM128 288a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm288 32a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/>
    </svg>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

import RoutingControl from './RoutingControl';

interface RouteMapProps {
    center: [number, number];
    zoom: number;
    position: [number, number];
    route: [number, number][];
}

const RouteMap = ({ center, zoom, position, route }: RouteMapProps) => {
    // Extract start and end points for the routing machine
    const startPoint = L.latLng(route[0][0], route[0][1]);
    const endPoint = L.latLng(route[route.length - 1][0], route[route.length - 1][1]);
    const waypoints = [startPoint, endPoint];

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={carIcon}>
                <Popup>
                    Device Location<br />
                    {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </Popup>
            </Marker>
            <RoutingControl waypoints={waypoints} />
        </MapContainer>
    );
};

export default RouteMap;
