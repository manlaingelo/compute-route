"use client";

import { useGeoTiff } from "@/hooks/useGeoTiff";
import { createGeoTiffCanvas } from "@/utils/geoTiffToCanvas";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { useEffect, useRef } from "react";
import Map, {
	Layer,
	type MapRef,
	NavigationControl,
	Source,
} from "react-map-gl/maplibre";

export interface GeoTiff3DMapProps {
	zipPath: string;
	initialViewState?: {
		longitude: number;
		latitude: number;
		zoom: number;
		pitch: number;
		bearing: number;
	};
	mapStyle?: string;
	rasterOpacity?: number;
}

const hillshadeLayer: maplibregl.HillshadeLayerSpecification = {
	id: "hillshade",
	type: "hillshade",
	source: "terrain-source",
	paint: {
		"hillshade-exaggeration": 0.8,
		"hillshade-shadow-color": "rgba(0, 0, 0, 0.5)",
		"hillshade-highlight-color": "rgba(255, 255, 255, 0.5)",
		"hillshade-accent-color": "rgba(0, 0, 0, 0.5)",
	},
};

export default function GeoTiff3DMap({
	zipPath,
	initialViewState = {
		longitude: 7.7491,
		latitude: 46.0207,
		zoom: 13,
		pitch: 60,
		bearing: 0,
	},
	mapStyle = "https://tiles.openfreemap.org/styles/bright",
	rasterOpacity = 0.7,
}: GeoTiff3DMapProps) {
	const mapRef = useRef<MapRef>(null);
	const { geoTiffData, loading, error } = useGeoTiff(zipPath);

	useEffect(() => {
		const protocol = new Protocol();
		maplibregl.addProtocol("pmtiles", protocol.tile);
		return () => {
			maplibregl.removeProtocol("pmtiles");
		};
	}, []);

	useEffect(() => {
		if (!geoTiffData || !mapRef.current) return;

		const map = mapRef.current.getMap();

		const addGeoTiffLayer = () => {
			if (!geoTiffData || !mapRef.current) return;
			const sourceId = "geotiff-source";
			const layerId = "geotiff-layer";
			const mapInstance = mapRef.current.getMap();

			if (mapInstance.getLayer(layerId)) {
				mapInstance.removeLayer(layerId);
			}
			if (mapInstance.getSource(sourceId)) {
				mapInstance.removeSource(sourceId);
			}

			const canvas = createGeoTiffCanvas(geoTiffData);

			mapInstance.addSource(sourceId, {
				type: "image",
				url: canvas.toDataURL(),
				coordinates: [
					[geoTiffData.bbox[0], geoTiffData.bbox[3]],
					[geoTiffData.bbox[2], geoTiffData.bbox[3]],
					[geoTiffData.bbox[2], geoTiffData.bbox[1]],
					[geoTiffData.bbox[0], geoTiffData.bbox[1]],
				],
			});

			mapInstance.addLayer({
				id: layerId,
				type: "raster",
				source: sourceId,
				paint: {
					"raster-opacity": rasterOpacity,
				},
			});

			mapInstance.fitBounds(
				[
					[geoTiffData.bbox[0], geoTiffData.bbox[1]],
					[geoTiffData.bbox[2], geoTiffData.bbox[3]],
				],
				{ padding: 50, duration: 1000 },
			);
		};

		if (!map.isStyleLoaded()) {
			map.once("load", () => addGeoTiffLayer());
		} else {
			addGeoTiffLayer();
		}
	}, [geoTiffData, rasterOpacity]);

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

			<Map
				ref={mapRef}
				initialViewState={initialViewState}
				style={{ width: "100%", height: "100%" }}
				mapStyle={mapStyle}
				maxPitch={85}
				terrain={{ source: "terrain-source", exaggeration: 0.1 }}
			>
				<Source
					id="terrain-source"
					type="raster-dem"
					url={
						"pmtiles://" +
						(typeof window !== "undefined" ? window.location.origin : "") +
						"/my_dem.pmtiles"
					}
					encoding="custom"
					redFactor={256}
					greenFactor={1}
					blueFactor={0}
					baseShift={0}
					tileSize={256}
					maxzoom={15}
				/>

				<Layer {...hillshadeLayer} />
				<NavigationControl position="top-right" />
			</Map>
		</div>
	);
}
