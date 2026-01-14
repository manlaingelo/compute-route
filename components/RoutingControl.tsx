import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

interface RoutingControlProps {
    waypoints: L.LatLng[];
}

const RoutingControl = ({ waypoints }: RoutingControlProps) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            show: false, // Hide the itinerary instructions
            addWaypoints: false,
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#3b82f6', opacity: 1, weight: 5 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0,
            },
        }).addTo(map);

        return () => {
            map.removeControl(routingControl);
        };
    }, [map, waypoints]);

    return null;
};

export default RoutingControl;
