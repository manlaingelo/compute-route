'use client';

import * as React from 'react';
import Map, { Source, Layer, MapRef, NavigationControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Protocol } from 'pmtiles';

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

const hillshadeLayer: maplibregl.HillshadeLayerSpecification = {
    id: 'hillshade',
    type: 'hillshade',
    source: 'terrain-source',
    paint: {
        'hillshade-exaggeration': 0.8,
        'hillshade-shadow-color': 'rgba(0, 0, 0, 0.5)',
        'hillshade-highlight-color': 'rgba(255, 255, 255, 0.5)',
        'hillshade-accent-color': 'rgba(0, 0, 0, 0.5)'
    }
};

const SATELLITE_STYLE: any = {
    version: 8,
    sources: {
        'esri-satellite': {
            type: 'raster',
            tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256
        }
    },
    layers: [
        {
            id: 'satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            paint: {}
        }
    ]
};

export default function ThreeDMap({
    initialViewState = {
        longitude: 7.7491,
        latitude: 46.0207,
        zoom: 13,
        pitch: 75,
        bearing: 0
    },
    mapStyle = 'https://tiles.openfreemap.org/styles/bright',
    targetLoc
}: Map3DProps) {
    const mapRef = React.useRef<MapRef>(null);
    const [styleMode, setStyleMode] = React.useState<'vector' | 'satellite'>('vector');

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

    // Register PMTiles protocol
    React.useEffect(() => {
        let protocol = new Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile);
        return () => {
            maplibregl.removeProtocol('pmtiles');
        };
    }, []);

    // Determine current style
    // Note: When switching to satellite, we use our local object. 
    // When vector, we use the prop.
    const currentStyle = styleMode === 'vector' ? mapStyle : SATELLITE_STYLE;

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-4 left-4 z-20">
                <button
                    onClick={() => setStyleMode(prev => prev === 'vector' ? 'satellite' : 'vector')}
                    className="px-4 py-2 bg-white/90 backdrop-blur text-black font-semibold rounded shadow-lg border border-gray-200 hover:bg-white transition-colors"
                >
                    {styleMode === 'vector' ? 'Switch to Satellite' : 'Switch to Vector'}
                </button>
            </div>

            <Map
                ref={mapRef}
                initialViewState={initialViewState}
                style={{ width: '100%', height: '100%' }}
                mapStyle={currentStyle}
                // OpenFreeMap doesn't need API key
                maxPitch={85}
                terrain={{ source: 'terrain-source', exaggeration: 0.1 }}
                onLoad={(e) => {
                    // @ts-ignore
                    window.map = e.target;
                }}
            >


                {/* Terrain Source */}
                <Source
                    id="terrain-source"
                    type="raster-dem"
                    url={'pmtiles://' + (typeof window !== 'undefined' ? window.location.origin : '') + '/my_dem.pmtiles'}
                    // @ts-ignore
                    encoding="custom"
                    // @ts-ignore
                    redFactor={256}
                    // @ts-ignore
                    greenFactor={1}
                    // @ts-ignore
                    blueFactor={0}
                    // @ts-ignore
                    baseShift={0}
                    tileSize={256}
                    maxzoom={15}
                />

                {/* Hillshade Layer - Only in Vector Mode */}
                {styleMode === 'vector' && (
                    <Layer {...hillshadeLayer} />
                )}

                {/* Navigation Control */}
                <NavigationControl position="top-right" />

                {/* 3D Buildings Layer - Only in Vector Mode (optional, but usually looks weird on satellite) */}
                {/* User didn't strictly say to remove buildings in satellite, but usually "Satellite" implies photographic view. 
                    However, "Vector view needs hillshading" implies separation. 
                    Let's keep buildings in vector mode only for cleanliness, or both if not specified.
                    User prompt: "Ensure the hillshade layer ... only renders when the map is in 'vector' mode"
                    It doesn't explicitly say remove buildings, but standard logic suggests it. 
                    I'll leave buildings in both for now as they provide context, but hillshade definitely only in vector.
                    Actually, let's keep buildings in both? No, let's keep buildings to Vector to match the "Map" aesthetic vs "Real" aesthetic.
                */}
                {styleMode === 'vector' && <Layer {...buildingsLayer} />}

                {/* Aimag Borders */}
                <Source id="aimag-source" type="geojson" data="/aimag.geojson">
                    <Layer
                        id="aimag-layer"
                        type="line"
                        paint={{
                            'line-color': '#ffffff',
                            'line-width': 2,
                            'line-opacity': 0.8
                        }}
                    />
                </Source>

                {/* Sky layer - Good for both */}
                {/* <Layer {...skyLayer} /> */}
            </Map>
        </div>
    );
}
