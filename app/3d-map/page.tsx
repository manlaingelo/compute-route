"use client";

import ThreeDMap from "@/components/ThreeDMap";
import { useGeoTiff } from "@/hooks/useGeoTiff";
import { createGeoTiffCanvas } from "@/utils/geoTiffToCanvas";
import type { MapRef } from "react-map-gl/maplibre";
import { useEffect, useRef } from "react";

export default function ThreeDMapPage() {
const mapRef = useRef<MapRef>(null);
const { geoTiffData, loading, error } = useGeoTiff("/slope_aspect.zip");

useEffect(() => {
if (!geoTiffData || !mapRef.current) return;

const map = mapRef.current.getMap();

// Wait for map to be loaded
if (!map.isStyleLoaded()) {
map.once("load", () => addGeoTiffLayer());
} else {
addGeoTiffLayer();
}

function addGeoTiffLayer() {
if (!geoTiffData || !mapRef.current) return;
const map = mapRef.current.getMap();

// Remove existing layer and source if present
if (map.getLayer("geotiff-layer")) {
map.removeLayer("geotiff-layer");
}
if (map.getSource("geotiff-source")) {
map.removeSource("geotiff-source");
}

// Create canvas from GeoTIFF data
const canvas = createGeoTiffCanvas(geoTiffData);

// Add source
map.addSource("geotiff-source", {
type: "image",
url: canvas.toDataURL(),
coordinates: [
[geoTiffData.bbox[0], geoTiffData.bbox[3]], // top-left
[geoTiffData.bbox[2], geoTiffData.bbox[3]], // top-right
[geoTiffData.bbox[2], geoTiffData.bbox[1]], // bottom-right
[geoTiffData.bbox[0], geoTiffData.bbox[1]], // bottom-left
],
});

// Add layer
map.addLayer({
id: "geotiff-layer",
type: "raster",
source: "geotiff-source",
paint: {
"raster-opacity": 0.7,
},
});

// Fit map to GeoTIFF bounds
map.fitBounds(
[
[geoTiffData.bbox[0], geoTiffData.bbox[1]], // southwest
[geoTiffData.bbox[2], geoTiffData.bbox[3]], // northeast
],
{ padding: 50, duration: 1000 },
);
}
}, [geoTiffData]);

return (
<div className="w-screen h-screen relative">
{loading && (
<div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
<div className="bg-white rounded-lg p-6 shadow-xl">
<p className="text-lg font-semibold">Loading GeoTIFF...</p>
</div>
</div>
)}

{error && (
<div className="absolute top-4 right-4 z-50 bg-red-500 text-white rounded-lg p-4 shadow-xl max-w-md">
<p className="font-semibold">Error loading GeoTIFF:</p>
<p className="text-sm">{error}</p>
</div>
)}

<ThreeDMap
ref={mapRef}
initialViewState={{
longitude: 7.7491,
latitude: 46.0207,
zoom: 13,
pitch: 60,
bearing: 0,
}}
/>
</div>
);
}
