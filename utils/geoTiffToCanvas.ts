import type { GeoTiffData } from "@/hooks/useGeoTiff";

export function createGeoTiffCanvas(geoTiffData: GeoTiffData): HTMLCanvasElement {
	const { width, height, data, min, max } = geoTiffData;

	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Could not get 2D context");
	}

	const imageData = ctx.createImageData(width, height);
	const pixels = imageData.data;

	// Normalize and colorize the data
	const range = max - min;

	for (let i = 0; i < data.length; i++) {
		const value = data[i];
		const pixelIndex = i * 4;

		// Handle nodata values
		if (value === -9999 || Number.isNaN(value)) {
			pixels[pixelIndex] = 0;
			pixels[pixelIndex + 1] = 0;
			pixels[pixelIndex + 2] = 0;
			pixels[pixelIndex + 3] = 0; // Transparent
		} else {
			// Normalize to 0-1
			const normalized = (value - min) / range;

			// Apply color ramp (viridis-like: blue -> green -> yellow -> red)
			const { r, g, b } = getColor(normalized);

			pixels[pixelIndex] = r;
			pixels[pixelIndex + 1] = g;
			pixels[pixelIndex + 2] = b;
			pixels[pixelIndex + 3] = 200; // Semi-transparent
		}
	}

	ctx.putImageData(imageData, 0, 0);
	return canvas;
}

function getColor(value: number): { r: number; g: number; b: number } {
	// Terrain color ramp
	const colors = [
		{ pos: 0.0, r: 0, g: 0, b: 128 }, // Dark blue
		{ pos: 0.2, r: 0, g: 128, b: 255 }, // Light blue
		{ pos: 0.4, r: 0, g: 255, b: 128 }, // Cyan-green
		{ pos: 0.6, r: 128, g: 255, b: 0 }, // Yellow-green
		{ pos: 0.8, r: 255, g: 200, b: 0 }, // Orange
		{ pos: 1.0, r: 255, g: 0, b: 0 }, // Red
	];

	// Find the two colors to interpolate between
	let lower = colors[0];
	let upper = colors[colors.length - 1];

	for (let i = 0; i < colors.length - 1; i++) {
		if (value >= colors[i].pos && value <= colors[i + 1].pos) {
			lower = colors[i];
			upper = colors[i + 1];
			break;
		}
	}

	// Interpolate
	const range = upper.pos - lower.pos;
	const t = range === 0 ? 0 : (value - lower.pos) / range;

	return {
		r: Math.round(lower.r + (upper.r - lower.r) * t),
		g: Math.round(lower.g + (upper.g - lower.g) * t),
		b: Math.round(lower.b + (upper.b - lower.b) * t),
	};
}
