"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default icon not found
import L from "leaflet";
import { useEffect, useState } from "react";

const icon = L.icon({
	iconUrl: "/images/marker-icon.png",
	shadowUrl: "/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowSize: [41, 41],
});

// Default icon fix if above doesn't work or we want standard default
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
	center: [number, number];
	zoom: number;
	children?: React.ReactNode;
}

const Map = ({ center, zoom, children }: MapProps) => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return (
			<div className="w-full h-full bg-gray-100 flex items-center justify-center">
				<p>Loading Map...</p>
			</div>
		);
	}

	return (
		<MapContainer
			center={center}
			zoom={zoom}
			style={{ height: "100%", width: "100%" }}
			className="z-0"
		>
			<TileLayer
				attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
				url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{children}
		</MapContainer>
	);
};

export default Map;
