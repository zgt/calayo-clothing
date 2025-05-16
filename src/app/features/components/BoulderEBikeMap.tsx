// src/app/features/_components/BoulderEBikeMap.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';

// Define location type
interface Location {
  name: string;
  lat: number;
  lng: number;
  description: string;
  isStartEnd?: boolean;
  order?: number;
}

const BoulderEBikeMap = () => {
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [totalDistance, setTotalDistance] = useState<string>('~15 miles');
  
  // Define the locations for the map
  const locations = useMemo(() => [
    { 
      name: "Bike Rental - Start/End (2512 Broadway)", 
      lat: 40.0214, 
      lng: -105.2805,
      description: "10:00 AM: Arrive for fitting & waivers\n10:30 AM: Depart on tour\n4:30 PM: Return bikes",
      isStartEnd: true
    },
    { 
      name: "Boulder Creek Festival", 
      lat: 40.0138, 
      lng: -105.2833,
      description: "1:00 PM: Enjoy food vendors, music & art\nPerfect lunch opportunity\nSpend 45-60 minutes exploring",
      order: 4
    },
    { 
      name: "Pearl Street Mall", 
      lat: 40.0181, 
      lng: -105.2785,
      description: "12:00 PM: Explore shops & street performers\nLock bikes at designated racks\nSpend about 45 minutes here",
      order: 2
    },
    { 
      name: "Hotel Boulderado", 
      lat: 40.0194, 
      lng: -105.2795,
      description: "11:00 AM: Quick visit to historic hotel\nSee original 1908 Otis Elevator\nAdmire the beautiful lobby",
      order: 1
    },
    { 
      name: "Boulder Dushanbe Tea House", 
      lat: 40.0147, 
      lng: -105.2771,
      description: "1:30 PM: Visit unique cultural landmark\nHandcrafted Tajik architecture\nOptional refreshment stop",
      order: 3
    },
    { 
      name: "University of Colorado & Folsom Field", 
      lat: 40.0076, 
      lng: -105.2659,
      description: "2:00 PM: Tour beautiful campus\nVisit Folsom Field (football stadium)\nEnjoy the architecture and grounds",
      order: 5
    },
    { 
      name: "Chautauqua Park & Flatirons View", 
      lat: 39.9999, 
      lng: -105.2831,
      description: "3:00 PM: Most uphill section (e-bikes help!)\nTake group photos with Flatirons backdrop\nEnjoy the historic park & scenic views",
      order: 6
    },
    { 
      name: "Eben G. Fine Park", 
      lat: 40.0119, 
      lng: -105.2982,
      description: "3:45 PM: Scenic creek-side park\nHistoric Arapahoe Indian site\nBrief stop before returning",
      order: 7
    }
  ], []);

  const handleMarkerClick = useCallback((location: Location) => {
    setSelectedMarker(location);
  }, []);

  // Function to calculate and display the route
  const calculateRoute = useCallback(async () => {
    if (!directionsService || !directionsRenderer) return;

    try {
      // Sort locations to get the correct order
      const orderedLocations = [...locations].sort((a, b) => {
        if (a.isStartEnd && !b.order) return -1;
        if (!a.order && b.isStartEnd) return 1;
        if (a.isStartEnd && b.isStartEnd) return 0;
        return (a.order ?? 99) - (b.order ?? 99);
      });

      // Create waypoints for all locations except start and end
      const waypoints = orderedLocations
        .filter(loc => !loc.isStartEnd)
        .map(loc => ({
          location: { lat: loc.lat, lng: loc.lng },
          stopover: true
        }));

      // Get start and end points
      const startLocation = orderedLocations.find(loc => loc.isStartEnd);
      const endLocation = orderedLocations[orderedLocations.length - 1];

      if (!startLocation || !endLocation) return;

      const request: google.maps.DirectionsRequest = {
        origin: { lat: startLocation.lat, lng: startLocation.lng },
        destination: { lat: startLocation.lat, lng: startLocation.lng }, // Return to start
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.BICYCLING,
        optimizeWaypoints: false
      };

      const result = await directionsService.route(request);
      directionsRenderer.setDirections(result);

      // Calculate total distance
      if (result.routes[0]) {
        const totalMeters = result.routes[0].legs.reduce((acc, leg) => acc + (leg.distance?.value ?? 0), 0);
        const totalMiles = (totalMeters / 1609.34).toFixed(1);
        setTotalDistance(`${totalMiles} miles`);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setError('Failed to calculate route. Please try refreshing the page.');
    }
  }, [directionsService, directionsRenderer, locations]);

  // Initialize directions service and renderer
  useEffect(() => {
    if (typeof window.google === 'undefined') return;

    // Wait for the Google Maps API to be fully loaded
    const initDirections = () => {
      if (typeof google.maps.DirectionsService === 'undefined') {
        setTimeout(initDirections, 100);
        return;
      }

      const service = new google.maps.DirectionsService();
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll use our own markers
        polylineOptions: {
          strokeColor: '#0088FF',
          strokeOpacity: 0.8,
          strokeWeight: 3
        }
      });

      setDirectionsService(service);
      setDirectionsRenderer(renderer);
    };

    initDirections();

    return () => {
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, []);

  // Calculate route when directions service and renderer are ready
  useEffect(() => {
    if (directionsService && directionsRenderer) {
      void calculateRoute();
    }
  }, [directionsService, directionsRenderer, calculateRoute]);

  // Map component that handles the directions renderer
  const MapWithDirections = () => {
    const map = useMap();
    
    useEffect(() => {
      if (map && directionsRenderer) {
        directionsRenderer.setMap(map);
      }
    }, [map, directionsRenderer]);

    return null;
  };

  return (
    <div className="map-container">
      <h2 className="text-xl font-bold mb-4 text-white text-center">Bachelor Party E-Bike Tour - Boulder, CO</h2>
      <div className="text-sm mb-4 text-emerald-200/80 text-center">Saturday, May 24, 2025 • 10:00 AM - 4:30 PM</div>
      
      {error && (
        <div className="bg-red-900/40 p-4 rounded-lg text-sm border border-red-700/30 mb-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}
      
      <div className="w-full h-[600px] rounded-lg border border-emerald-700/30 shadow-lg mb-4 bg-emerald-900/30">
        <APIProvider 
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}
          libraries={['marker', 'places']}
        >
          <Map
            defaultCenter={{ lat: 40.0150, lng: -105.2705 }}
            defaultZoom={13}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ?? 'boulder_ebike_tour'}
            mapTypeId="terrain"
            className="w-full h-full rounded-lg"
          >
            <MapWithDirections />
            {locations.map((location) => (
              <AdvancedMarker
                key={location.name}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => handleMarkerClick(location)}
                title={location.name}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    location.isStartEnd ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                >
                  {location.isStartEnd ? 'S' : location.order}
                </div>
              </AdvancedMarker>
            ))}

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="max-w-xs p-2">
                  <h3 className="font-bold text-lg mb-2">{selectedMarker.name}</h3>
                  <p className="whitespace-pre-line">{selectedMarker.description}</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
      
      <div className="bg-emerald-900/40 p-4 rounded-lg text-sm border border-emerald-700/30">
        <h3 className="font-bold mb-2 text-white">Tour Notes:</h3>
        <ul className="list-disc pl-5 space-y-1 text-emerald-200/80">
          <li>Green marker indicates start/end point at bike rental (2512 Broadway)</li>
          <li>Numbered markers show the order of destinations</li>
          <li>Click markers for timing details and information</li>
          <li>Total distance: {totalDistance} • Duration: 6 hours including stops</li>
          <li>Blue line shows approximate route (actual cycling paths may vary)</li>
        </ul>
      </div>
      <div className="mt-4 text-sm text-emerald-300/60 text-center">
        Demonstration map created for Grant&apos;s Bachelor Party - May 2025
      </div>
    </div>
  );
};

export default BoulderEBikeMap;