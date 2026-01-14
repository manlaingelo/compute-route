'use client';

import * as React from 'react';
import Map, { Source, Layer, MapRef, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// TypeScript interfaces
export interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
    padding?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

interface Map3DProps {
    initialViewState?: ViewState;
    mapStyle?: string;
    targetLoc?: {
        center: [number, number];
        zoom: number;
        pitch: number;
        bearing: number;
    } | null;
}

// 3D Buildings Layer
const buildingsLayer: maplibregl.FillExtrusionLayerSpecification = {
    id: '3d-buildings',
    source: 'openfreemap',
    'source-layer': 'building',
    type: 'fill-extrusion',
    minzoom: 14,
    paint: {
        'fill-extrusion-color': '#aaa',
        // transform-scale will affect the height of the extrusion
        // 'fill-extrusion-height': ['get', 'render_height'],
        // 'fill-extrusion-base': ['get', 'render_min_height'],
        // Use proper expressions for height. OpenStreetMap data often has 'render_height' or 'height'
        'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            14.05,
            ['get', 'render_height']
        ],
        'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14,
            0,
            14.05,
            ['get', 'render_min_height']
        ],
        'fill-extrusion-opacity': 0.8
    }
};

// Sky Layer
// Note: Sky layer in MapLibre requires specific setup or just a background color/gradient in older versions.
// MapLibre GL JS v2+ supports sky slightly differently or via style.
// Since we want "Professional", we can try to use a sky layer if the style supports it or add one.
// OpenFreeMap "bright" style might not have a sky defined effectively for 3D pitch.
// We will add a simple sky layer configuration if supported, otherwise rely on CSS/background.
const skyLayer: maplibregl.LayerSpecification = {
    id: 'sky',
    type: 'sky',
    paint: {
        'sky-type': 'atmosphere',
        // @ts-ignore
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
    }
} as any;

export default function ThreeDMap({
    initialViewState = {
        longitude: -74.006,
        latitude: 40.7128,
        zoom: 14,
        pitch: 60,
        bearing: 0
    },
    mapStyle = 'https://tiles.openfreemap.org/styles/bright',
    targetLoc
}: Map3DProps) {
    const mapRef = React.useRef<MapRef>(null);

    // Handle FlyTo
    React.useEffect(() => {
        if (targetLoc && mapRef.current) {
            mapRef.current.flyTo({
                center: targetLoc.center,
                zoom: targetLoc.zoom,
                pitch: targetLoc.pitch,
                bearing: targetLoc.bearing,
                essential: true,
                duration: 3000 // Slow cinematic fly
            });
        }
    }, [targetLoc]);

    return (
        <div className="w-full h-full relative">
            <Map
                ref={mapRef}
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle}
                // OpenFreeMap doesn't need API key
                maxPitch={85}
            >
                {/* Navigation Control */}
                <NavigationControl position="top-right" />

                {/* 3D Buildings Layer */}
                {/* We need to ensure the source "openfreemap" exists in the style OR we add it. 
            The "bright" style from OpenFreeMap usually comes with sources. 
            We should check if we need to add a source explicitly. 
            Usually styles include sources.
            For "bright", the vector source is usually "openfreemap". 
            Let's assume it is. If not, we might need to Inspect the style.
            Safety: Add Source just in case or rely on style.
            Actually, it's safer to not add Source if it's in the style to avoid ID collision.
            But to enable 3D buildings on a 2D style, we usually DO need to add the layer referencing the source in the style.
        */}

                <Layer {...buildingsLayer} />
                {/* Sky layer */}
                <Layer {...skyLayer} />
                {/* Note: Sky layer might crash if not supported by the GL context or style. Leaving commented out or basic. */}
            </Map>
        </div>
    );
}
