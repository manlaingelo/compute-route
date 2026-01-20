"use client";

import { useEffect, useState } from "react";
import JSZip from "jszip";
import { fromArrayBuffer } from "geotiff";

export interface GeoTiffData {
	image: any;
	width: number;
	height: number;
	bbox: [number, number, number, number]; // [west, south, east, north]
	data: Float32Array | Uint8Array;
	min: number;
	max: number;
}

export function useGeoTiff(zipPath: string) {
	const [geoTiffData, setGeoTiffData] = useState<GeoTiffData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadGeoTiff() {
			try {
				setLoading(true);
				setError(null);

				// Fetch the zip file
				const response = await fetch(zipPath);
				if (!response.ok) {
					throw new Error(`Failed to fetch ${zipPath}`);
				}

				const arrayBuffer = await response.arrayBuffer();

				// Unzip
				const zip = await JSZip.loadAsync(arrayBuffer);

				// Find the .tif file
				const tifFile = Object.keys(zip.files).find(
					(name) =>
						name.toLowerCase().endsWith(".tif") ||
						name.toLowerCase().endsWith(".tiff"),
				);

				if (!tifFile) {
					throw new Error("No GeoTIFF file found in zip");
				}

				// Extract the tif file
				const tifArrayBuffer = await zip.files[tifFile].async("arraybuffer");

				// Parse GeoTIFF
				const tiff = await fromArrayBuffer(tifArrayBuffer);
				const image = await tiff.getImage();

				// Get raster data
				const rasters = await image.readRasters();
				const data = rasters[0] as Float32Array | Uint8Array;

				// Get bounding box
				const bbox = image.getBoundingBox();

				// Calculate min/max for normalization
				let min = Number.POSITIVE_INFINITY;
				let max = Number.NEGATIVE_INFINITY;
				for (let i = 0; i < data.length; i++) {
					const value = data[i];
					if (value !== -9999 && !Number.isNaN(value)) {
						// Common nodata value
						if (value < min) min = value;
						if (value > max) max = value;
					}
				}

				if (isMounted) {
					setGeoTiffData({
						image,
						width: image.getWidth(),
						height: image.getHeight(),
						bbox: bbox as [number, number, number, number],
						data,
						min,
						max,
					});
					setLoading(false);
				}
			} catch (err) {
				console.error("Error loading GeoTIFF:", err);
				if (isMounted) {
					setError(err instanceof Error ? err.message : "Unknown error");
					setLoading(false);
				}
			}
		}

		loadGeoTiff();

		return () => {
			isMounted = false;
		};
	}, [zipPath]);

	return { geoTiffData, loading, error };
}
