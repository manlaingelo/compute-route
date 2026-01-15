import { useEffect, useState } from "react";
import { UB_ROUTE } from "../utils/routeData";

export const useDeviceLocation = (speed: number = 1000) => {
	// Current position index
	const [currentIndex, setCurrentIndex] = useState(0);
	// Current exact position (interpolated or discrete)
	const [position, setPosition] = useState<[number, number]>(UB_ROUTE[0]);

	// We can just step through the points for simplicity first
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => {
				const nextIndex = (prevIndex + 1) % UB_ROUTE.length;
				return nextIndex;
			});
		}, speed);

		return () => clearInterval(interval);
	}, [speed]);

	useEffect(() => {
		setPosition(UB_ROUTE[currentIndex]);
	}, [currentIndex]);

	return { position, route: UB_ROUTE };
};
