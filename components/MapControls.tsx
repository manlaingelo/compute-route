"use client";

import * as React from "react";

export type City = "UB" | "Tokyo" | "Paris";
export type Theme = "day" | "night";

interface MapControlsProps {
	onFlyTo: (city: City) => void;
	onToggleTheme: (theme: Theme) => void;
	onReset: () => void;
	currentTheme: Theme;
}

export default function MapControls({
	onFlyTo,
	onToggleTheme,
	onReset,
	currentTheme,
}: MapControlsProps) {
	return (
		<div
			className="absolute top-4 right-4 z-10 flex flex-col gap-3 p-4 
                    bg-white/10 backdrop-blur-md border border-white/20 
                    rounded-xl shadow-xl text-white w-64"
		>
			<h3 className="text-lg font-bold mb-2 text-white drop-shadow-md">
				Dashboard
			</h3>

			{/* Fly To Controls */}
			<div className="flex flex-col gap-2">
				<label className="text-xs uppercase tracking-wide opacity-80 font-semibold">
					Fly To
				</label>
				<div className="grid grid-cols-3 gap-2">
					<button
						onClick={() => onFlyTo("UB")}
						className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/40 
                       border border-blue-400/30 rounded-md transition-all text-xs"
					>
						UB
					</button>
					<button
						onClick={() => onFlyTo("Tokyo")}
						className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/40 
                       border border-purple-400/30 rounded-md transition-all text-xs"
					>
						Tokyo
					</button>
					<button
						onClick={() => onFlyTo("Paris")}
						className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/40 
                       border border-amber-400/30 rounded-md transition-all text-xs"
					>
						Paris
					</button>
				</div>
			</div>

			<div className="w-full h-px bg-white/10 my-1" />

			{/* Theme Toggle */}
			<div className="flex items-center justify-between">
				<span className="text-sm font-medium">Night Mode</span>
				<button
					onClick={() =>
						onToggleTheme(currentTheme === "day" ? "night" : "day")
					}
					className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors 
                      ${currentTheme === "night" ? "bg-indigo-500" : "bg-gray-400/50"}`}
				>
					<span
						className={`inline-block h-4 w-4 transform rounded-full bg-white transition z-10
                        ${currentTheme === "night" ? "translate-x-6" : "translate-x-1"}`}
					/>
				</button>
			</div>

			{/* Reset Button */}
			<button
				onClick={onReset}
				className="mt-2 w-full py-1.5 bg-red-500/20 hover:bg-red-500/40 
                    border border-red-400/30 rounded-lg text-sm transition-all"
			>
				Reset Camera
			</button>
		</div>
	);
}
