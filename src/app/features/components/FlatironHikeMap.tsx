// src/app/features/components/FlatironHikeMap.tsx
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

const FlatironHikeMap = () => {
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [totalDistance, setTotalDistance] = useState<string>('~5 miles');
  const [totalElevation, setTotalElevation] = useState<string>('~1,400 ft gain');
  
  // Define the locations for the map - based on the Google Maps link provided
  const locations = useMemo(() => [
    {
      name: "Airbnb - Start/End 1",
      lat: 39.9887,
      lng: -105.2689,
      description: "7:00 AM: Meet at Airbnb\nPrepare equipment and supplies\nReview trail map and safety information",
      isStartEnd: true,
      order: 1
    },
    {
      name: "Hollyberry Connector Trailhead",
      lat: 39.98655349651819,
      lng: -105.27614104335103,
      description: "7:20 AM: Begin hike at Hollyberry Connector\nCheck trail conditions\nFirst stretch of the hike begins here",
      order: 2
    },
    {
      name: "Hollyberry & Skunk Canyon Junction",
      lat: 39.9870,
      lng: -105.2789,
      description: "7:35 AM: Turn left onto Skunk Canyon Trail\nWatch for trail markers\nBegin gradual ascent into canyon area",
      order: 3
    },
    {
      name: "Skunk Canyon & Spur Junction",
      lat: 39.9885,
      lng: -105.2824,
      description: "7:50 AM: Turn right onto Skunk Canyon Spur Trail\nTrail narrows here\nBegin to see better views of surrounding area",
      order: 4
    },
    {
      name: "Skunk Canyon Spur Fork",
      lat: 39.9915,
      lng: -105.2854,
      description: "8:05 AM: Continue left at fork\nStay on Skunk Canyon Spur Trail\nMorning light beginning to illuminate the Flatirons",
      order: 5
    },
    {
      name: "Skunk Canyon Spur & Kohler Mesa Junction 2",
      lat: 39.99173241099551,
      lng: -105.28598945061064,
      description: "8:20 AM: Turn right onto Kohler Mesa Trail\nTrail becomes more level here\nGood views of the foothills",
      order: 6
    },
    {
      name: "Kohler Mesa & Enchanted Kohler Junction",
      lat: 39.989681947494354,
      lng: -105.28885694258133,
      description: "8:35 AM: Turn left onto Enchanted Kohler Spur Trail\nBeautiful forest section\nWatch for wildlife in the morning hours",
      order: 7
    },
    {
      name: "Enchanted Mesa Trail",
      lat: 39.991205154828855,
      lng: -105.28981277323436,
      description: "8:50 AM: Continue on Enchanted Mesa Trail\nGentle terrain with shade\nGood spot for a quick water break",
      order: 8
    },
    {
      name: "First Flatiron",
      lat: 39.9905167864851,
      lng: -105.2947353011215,
      description: "9:05 AM: Go straight through four-way intersection\nStay on main trail\nTrail becomes busier with hikers here",
      order: 9
    },
    {
        name: "Mesa Trail Junction",
        lat: 39.991659181221316,
        lng: -105.29123696092553,
        description: "9:20 AM: Turn right onto Mesa Trail\nWider trail with some rocky sections\nViews begin to open up toward the Flatirons",
        order: 10
      },
      {
        name: "Mesa Trail & Bluebell Road Junction",
        lat: 39.99231824641437,
        lng: -105.28783420378622,
        description: "9:35 AM: Turn left onto Bluebell Road\nRestrooms available here\nGood spot for a snack break",
        order: 11
      },
      {
        name: "Mesa Trail & Bluebell Road Junction 2",
        lat: 39.99114937673362,
        lng: -105.28751523769094,
        description: "9:35 AM: Turn left onto Bluebell Road\nRestrooms available here\nGood spot for a snack break",
        order: 12
      },
      {
        name: "Skunk Canyon Spur & Kohler Mesa Junction",
        lat: 39.99173241099551,
        lng: -105.28598945061064,
        description: "8:20 AM: Turn right onto Kohler Mesa Trail\nTrail becomes more level here\nGood views of the foothills",
        order: 13
      },
      {
        name: "bathrooms",
        lat: 39.99160797194278,
        lng: -105.2856520892235,
        description: "8:05 AM: Continue left at fork\nStay on Skunk Canyon Spur Trail\nMorning light beginning to illuminate the Flatirons",
        order: 14
      },
      {
        name: "mesa trail",
        lat: 39.9915,
        lng: -105.2854,
        description: "8:05 AM: Continue left at fork\nStay on Skunk Canyon Spur Trail\nMorning light beginning to illuminate the Flatirons",
        order: 15
      },
      {
        name: "Skunk Canyon & Spur Junction 2",
        lat: 39.9885,
        lng: -105.2824,
        description: "7:50 AM: Turn right onto Skunk Canyon Spur Trail\nTrail narrows here\nBegin to see better views of surrounding area",
        order: 16
      },
      {
        name: "Hollyberry & Skunk Canyon Junction 2",
        lat: 39.9870,
        lng: -105.2789,
        description: "7:35 AM: Turn left onto Skunk Canyon Trail\nWatch for trail markers\nBegin gradual ascent into canyon area",
        order: 17
      },
      {
        name: "Hollyberry Connector Trailhead 2",
        lat: 39.98655349651819,
        lng: -105.27614104335103,
        description: "7:20 AM: Begin hike at Hollyberry Connector\nCheck trail conditions\nFirst stretch of the hike begins here",
        order: 18
      },
      {
        name: "Airbnb - Start/End",
        lat: 39.9887,
        lng: -105.2689,
        description: "7:00 AM: Meet at Airbnb\nPrepare equipment and supplies\nReview trail map and safety information",
        isStartEnd: true,
        order: 19
      },
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
        if (a.order && b.order) return a.order - b.order;
        if (a.order) return -1;
        if (b.order) return 1;
        return 0;
      });

      // Create waypoints for all locations except start and end
      const waypoints = orderedLocations
        .filter((loc, index) => index !== 0 && index !== orderedLocations.length - 1)
        .map(loc => ({
          location: { lat: loc.lat, lng: loc.lng },
          stopover: true
        }));

      // Get start and end points
      const startLocation = orderedLocations[0];
      const endLocation = orderedLocations[orderedLocations.length - 1];

      // Add safety check for start and end locations
      if (!startLocation || !endLocation) {
        setError('Unable to determine start or end location');
        return;
      }

      const request: google.maps.DirectionsRequest = {
        origin: { lat: startLocation.lat, lng: startLocation.lng },
        destination: { lat: endLocation.lat, lng: endLocation.lng },
        waypoints: waypoints,
        travelMode: google.maps.TravelMode.WALKING,
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
      setError('Failed to calculate hiking route. Please try refreshing the page.');
    }
  }, [directionsService, directionsRenderer, locations]);

  // Initialize directions service and renderer
  useEffect(() => {
    // Commented out to disable Google Maps API
    /*
    if (typeof window === 'undefined' || typeof window.google === 'undefined') return;

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
          strokeColor: '#4CAF50', // Green color for hiking trail
          strokeOpacity: 0.8,
          strokeWeight: 4
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
    */
  }, []);

  // Calculate route when directions service and renderer are ready
  useEffect(() => {
    // Commented out to disable route calculation
    /*
    if (directionsService && directionsRenderer) {
      void calculateRoute();
    }
    */
  }, [directionsService, directionsRenderer, calculateRoute]);

  // Map component that handles the directions renderer
  const MapWithDirections = () => {
    const map = useMap();
    
    useEffect(() => {
      // Commented out to disable map rendering
      /*
      if (map && directionsRenderer) {
        directionsRenderer.setMap(map);
      }
      */
    }, [map, directionsRenderer]);

    return null;
  };

  return (
    <div className="map-container">
      <h2 className="text-xl font-bold mb-4 text-white text-center">First Flatiron Hiking Trail - Boulder, CO</h2>
      <div className="text-sm mb-4 text-emerald-200/80 text-center">Saturday, May 25, 2025 • 7:00 AM - 3:00 PM</div>
      
      {error && (
        <div className="bg-red-900/40 p-4 rounded-lg text-sm border border-red-700/30 mb-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}
      
      <div className="w-full h-[600px] rounded-lg border border-emerald-700/30 shadow-lg mb-4 bg-emerald-900/30">
        {/* Commented out Google Maps API Provider
        <APIProvider 
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}
          libraries={['marker', 'places']}
        >
          <Map
            defaultCenter={{ lat: 39.989, lng: -105.279 }}
            defaultZoom={14}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID ?? 'flatiron_hike_map'}
            mapTypeId="terrain"
            className="w-full h-full rounded-lg"
          >
            <MapWithDirections />
            {locations.map((location) => (
              location.order === 1 || location.order === 9 ? (
                <AdvancedMarker
                  key={location.name}
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleMarkerClick(location)}
                  title={location.name}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      location.isStartEnd ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                  >
                    {location.order === 9 ? 2 : location.order}
                  </div>
                </AdvancedMarker>
              ) : null
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
        */}
        <div className="w-full h-full flex items-center justify-center text-emerald-200/80">
          Map temporarily disabled
        </div>
      </div>
      
      <div className="bg-emerald-900/40 p-4 rounded-lg text-sm border border-emerald-700/30">
        <h3 className="font-bold mb-2 text-white">Hike Details:</h3>
        <ul className="list-disc pl-5 space-y-1 text-emerald-200/80">
          <li>Total distance: {totalDistance} • Elevation gain: {totalElevation}</li>
          <li>Starting point: 1900 Dartmouth Ave (green marker)</li>
          <li>Primary attraction: First Flatiron at Chautauqua Park</li>
          <li>Difficulty: Moderate to challenging with steep sections</li>
          <li>Required: At least 2 liters of water per person and sun protection</li>
          <li>Recommended: Morning start to avoid afternoon thunderstorms</li>
        </ul>
      </div>
      <div className="mt-4 text-sm text-emerald-300/60 text-center">
        Demonstration map created for Grant&apos;s Bachelor Party - May 2025
      </div>
    </div>
  );
};

export default FlatironHikeMap;