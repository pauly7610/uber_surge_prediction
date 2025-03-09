import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useStyletron } from 'baseui';
import { Select, Value } from 'baseui/select';
import { useQuery } from '@apollo/client';
import { GET_DRIVER_HEATMAP_DATA } from '../../graphql/queries';
import { StyledSpinnerNext as Spinner } from 'baseui/spinner';
import CardWrapper from '../common/CardWrapper';
import Button from '../common/Button';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FlyToInterpolator } from '@deck.gl/core';

// Define types for cleaner code
interface CityData {
  name: string;
  longitude: number;
  latitude: number;
  zoom: number;
}

interface HeatmapPoint {
  position: [number, number];
  value: number;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  transitionDuration?: number;
  transitionInterpolator?: any;
}

interface DriverHeatmapProps {
  selectedDate?: Date;
}

// Define hotspot type
interface Hotspot {
  longitude: number;
  latitude: number;
  intensity: number;
  radius: number;
}

// City coordinates with more precise locations for realistic heatmaps
const US_CITIES: CityData[] = [
  { name: "San Francisco", longitude: -122.4194, latitude: 37.7749, zoom: 12 },
  { name: "New York", longitude: -74.0060, latitude: 40.7128, zoom: 12 },
  { name: "Los Angeles", longitude: -118.2437, latitude: 34.0522, zoom: 11 },
  { name: "Chicago", longitude: -87.6298, latitude: 41.8781, zoom: 11 },
  { name: "Miami", longitude: -80.1918, latitude: 25.7617, zoom: 12 },
];

const DEFAULT_CITY = US_CITIES[0];

const INITIAL_VIEW_STATE: ViewState = {
  longitude: DEFAULT_CITY.longitude,
  latitude: DEFAULT_CITY.latitude,
  zoom: DEFAULT_CITY.zoom,
  pitch: 45,
  bearing: 0,
};

// City-specific hotspots for realistic demand patterns
const CITY_HOTSPOTS: Record<string, Hotspot[]> = {
  "San Francisco": [
    // Financial District (high demand)
    { longitude: -122.399, latitude: 37.794, intensity: 0.9, radius: 0.5 },
    // SoMa (high demand)
    { longitude: -122.401, latitude: 37.778, intensity: 0.85, radius: 0.5 },
    // Mission District (medium-high demand)
    { longitude: -122.418, latitude: 37.763, intensity: 0.8, radius: 0.6 },
    // North Beach (medium demand)
    { longitude: -122.409, latitude: 37.800, intensity: 0.75, radius: 0.4 },
    // Union Square (medium-high demand)
    { longitude: -122.408, latitude: 37.788, intensity: 0.85, radius: 0.4 },
    // Marina (medium demand)
    { longitude: -122.435, latitude: 37.803, intensity: 0.7, radius: 0.4 },
    // Castro (medium demand)
    { longitude: -122.435, latitude: 37.761, intensity: 0.75, radius: 0.4 },
    // Haight (medium demand)
    { longitude: -122.446, latitude: 37.769, intensity: 0.7, radius: 0.4 },
    // Sunset (lower demand)
    { longitude: -122.480, latitude: 37.760, intensity: 0.5, radius: 0.5 },
    // Richmond (lower demand)
    { longitude: -122.480, latitude: 37.780, intensity: 0.5, radius: 0.5 },
    // Potrero Hill (medium demand)
    { longitude: -122.400, latitude: 37.760, intensity: 0.65, radius: 0.4 },
    // SFO Airport (high demand)
    { longitude: -122.383, latitude: 37.621, intensity: 0.9, radius: 0.6 }
  ],
  "New York": [
    // Midtown Manhattan (high demand)
    { longitude: -73.984, latitude: 40.754, intensity: 0.95, radius: 0.6 },
    // Downtown/Financial District (high demand)
    { longitude: -74.010, latitude: 40.709, intensity: 0.9, radius: 0.5 },
    // Times Square (very high demand)
    { longitude: -73.986, latitude: 40.758, intensity: 1.0, radius: 0.4 },
    // Upper East Side (medium-high demand)
    { longitude: -73.960, latitude: 40.774, intensity: 0.8, radius: 0.5 },
    // Upper West Side (medium-high demand)
    { longitude: -73.980, latitude: 40.786, intensity: 0.8, radius: 0.5 },
    // Greenwich Village (medium-high demand)
    { longitude: -73.997, latitude: 40.731, intensity: 0.8, radius: 0.4 },
    // Williamsburg, Brooklyn (medium demand)
    { longitude: -73.957, latitude: 40.714, intensity: 0.75, radius: 0.5 },
    // Downtown Brooklyn (medium-high demand)
    { longitude: -73.988, latitude: 40.692, intensity: 0.85, radius: 0.5 },
    // LaGuardia Airport (high demand)
    { longitude: -73.873, latitude: 40.776, intensity: 0.9, radius: 0.6 },
    // JFK Airport (high demand)
    { longitude: -73.779, latitude: 40.641, intensity: 0.9, radius: 0.7 }
  ],
  "Los Angeles": [
    // Downtown LA (high demand)
    { longitude: -118.243, latitude: 34.052, intensity: 0.9, radius: 0.6 },
    // Hollywood (high demand)
    { longitude: -118.329, latitude: 34.093, intensity: 0.85, radius: 0.5 },
    // Santa Monica (medium-high demand)
    { longitude: -118.491, latitude: 34.020, intensity: 0.8, radius: 0.5 },
    // Beverly Hills (medium-high demand)
    { longitude: -118.400, latitude: 34.073, intensity: 0.8, radius: 0.5 },
    // Venice (medium demand)
    { longitude: -118.473, latitude: 33.988, intensity: 0.75, radius: 0.4 },
    // Koreatown (medium demand)
    { longitude: -118.309, latitude: 34.057, intensity: 0.7, radius: 0.4 },
    // LAX Airport (high demand)
    { longitude: -118.408, latitude: 33.942, intensity: 0.9, radius: 0.7 }
  ],
  "Chicago": [
    // The Loop (high demand)
    { longitude: -87.630, latitude: 41.878, intensity: 0.9, radius: 0.5 },
    // Magnificent Mile (high demand)
    { longitude: -87.625, latitude: 41.893, intensity: 0.85, radius: 0.4 },
    // Wrigleyville (medium-high demand)
    { longitude: -87.655, latitude: 41.948, intensity: 0.8, radius: 0.4 },
    // River North (medium-high demand)
    { longitude: -87.634, latitude: 41.892, intensity: 0.8, radius: 0.4 },
    // West Loop (medium-high demand)
    { longitude: -87.649, latitude: 41.883, intensity: 0.8, radius: 0.4 },
    // Lincoln Park (medium demand)
    { longitude: -87.644, latitude: 41.923, intensity: 0.75, radius: 0.5 },
    // O'Hare Airport (high demand)
    { longitude: -87.904, latitude: 41.978, intensity: 0.9, radius: 0.7 },
    // Midway Airport (medium-high demand)
    { longitude: -87.752, latitude: 41.786, intensity: 0.85, radius: 0.6 }
  ],
  "Miami": [
    // South Beach (high demand)
    { longitude: -80.134, latitude: 25.783, intensity: 0.9, radius: 0.5 },
    // Downtown Miami (high demand)
    { longitude: -80.192, latitude: 25.774, intensity: 0.85, radius: 0.5 },
    // Brickell (high demand)
    { longitude: -80.191, latitude: 25.760, intensity: 0.85, radius: 0.4 },
    // Wynwood (medium-high demand)
    { longitude: -80.199, latitude: 25.802, intensity: 0.8, radius: 0.4 },
    // Miami Beach (medium-high demand)
    { longitude: -80.141, latitude: 25.814, intensity: 0.8, radius: 0.5 },
    // Design District (medium demand)
    { longitude: -80.193, latitude: 25.813, intensity: 0.75, radius: 0.4 },
    // Coral Gables (medium demand)
    { longitude: -80.271, latitude: 25.751, intensity: 0.7, radius: 0.5 },
    // Miami Airport (high demand)
    { longitude: -80.287, latitude: 25.795, intensity: 0.9, radius: 0.6 }
  ]
};

// Define water boundaries for major cities
const WATER_BOUNDARIES: Record<string, (lng: number, lat: number) => boolean> = {
  "San Francisco": (lng: number, lat: number): boolean => {
    // SF Bay
    if (lng > -122.52 && lng < -122.35 && lat > 37.70 && lat < 37.84) {
      // Golden Gate Bridge section
      if (lng >= -122.485 && lng <= -122.475 && lat >= 37.805 && lat <= 37.82) {
        return true;
      }
      
      // SF Peninsula
      if (lng < -122.38 && lat > 37.75) {
        return true;
      }
      
      // Treasure Island
      if (lng >= -122.375 && lng <= -122.365 && lat >= 37.81 && lat <= 37.835) {
        return true;
      }
      
      // Bay Bridge
      if (lng >= -122.380 && lng <= -122.35 && lat >= 37.795 && lat <= 37.805) {
        return true;
      }
      
      return false; // Water in the bay
    }
    
    // Pacific Ocean (west of SF)
    if (lng < -122.52 && lat > 37.70 && lat < 37.85) {
      return false;
    }
    
    return true; // Assume land otherwise
  },
  
  "New York": (lng: number, lat: number): boolean => {
    // Hudson River
    if (lng > -74.02 && lng < -73.97 && lat > 40.68 && lat < 40.85) {
      return false;
    }
    
    // East River
    if (lng > -74.01 && lng < -73.93 && lat > 40.69 && lat < 40.77) {
      return false;
    }
    
    // New York Harbor
    if (lng > -74.04 && lng < -73.97 && lat > 40.65 && lat < 40.71) {
      return false;
    }
    
    // Jamaica Bay
    if (lng > -73.88 && lng < -73.78 && lat > 40.58 && lat < 40.66) {
      return false;
    }
    
    return true; // Assume land otherwise
  },
  
  "Los Angeles": (lng: number, lat: number): boolean => {
    // Pacific Ocean (west of LA)
    if (lng < -118.50) {
      return false;
    }
    
    // Santa Monica Bay
    if (lng < -118.42 && lat > 33.90 && lat < 34.05) {
      return false;
    }
    
    // Marina Del Rey
    if (lng > -118.48 && lng < -118.43 && lat > 33.96 && lat < 34.00) {
      return false;
    }
    
    return true; // Assume land otherwise
  },
  
  "Chicago": (lng: number, lat: number): boolean => {
    // Lake Michigan
    if (lng > -87.65 && lat > 41.85) {
      return false;
    }
    
    return true; // Assume land otherwise
  },
  
  "Miami": (lng: number, lat: number): boolean => {
    // Atlantic Ocean
    if (lng > -80.12 && lat < 25.76) {
      return false;
    }
    
    // Biscayne Bay
    if (lng > -80.20 && lng < -80.15 && lat > 25.75 && lat < 25.85) {
      return false;
    }
    
    return true; // Assume land otherwise
  }
};

const DriverHeatmap: React.FC<DriverHeatmapProps> = ({ selectedDate = new Date() }) => {
  const [css] = useStyletron();
  const [timeframe, setTimeframe] = useState<Value>([{ id: '1', label: 'Next Hour' }]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>(DEFAULT_CITY.name);
  
  // Using useRef to store viewState and prevent excessive re-renders
  const viewStateRef = useRef<ViewState>(INITIAL_VIEW_STATE);
  
  // Query data (disabled, using mock data)
  const { loading, error } = useQuery(GET_DRIVER_HEATMAP_DATA, { 
    skip: true,
    variables: { timeframe: timeframe && timeframe.length > 0 ? String(timeframe[0]?.label || '') : 'Next Hour' }
  });

  // Function to check if a point is on land (not in water)
  const isPointOnLand = useCallback((longitude: number, latitude: number): boolean => {
    const waterBoundaryCheck = WATER_BOUNDARIES[selectedCity];
    if (waterBoundaryCheck) {
      return waterBoundaryCheck(longitude, latitude);
    }
    return true; // Assume land if no water boundary defined
  }, [selectedCity]);

  // Generate realistic heatmap data based on city hotspots
  const generateHeatmapPoints = useCallback((): HeatmapPoint[] => {
    const points: HeatmapPoint[] = [];
    const hotspots = CITY_HOTSPOTS[selectedCity] || [];
    
    // Get date factors for variation
    const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
    const hour = selectedDate.getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 19);
    
    // Timeframe adjustment
    const timeframeLabel = timeframe && timeframe.length > 0 ? String(timeframe[0]?.label || '') : 'Next Hour';
    const timeMultiplier = timeframeLabel.includes('Hour') ? 1 : 
                          timeframeLabel.includes('3') ? 0.8 : 0.6;
    
    // Process each hotspot
    hotspots.forEach((hotspot, index) => {
      // Adjust intensity based on time and day
      let adjustedIntensity = hotspot.intensity;
      
      // Weekend vs weekday patterns
      if (isWeekend) {
        // Business areas logic (using coordinates directly instead of name checking)
        if ((selectedCity === 'San Francisco' && hotspot.latitude > 37.78 && hotspot.longitude < -122.39)) {
          adjustedIntensity *= 0.7;
        } 
        // Entertainment areas
        else if (
          (selectedCity === 'San Francisco' && 
            ((hotspot.longitude > -122.42 && hotspot.longitude < -122.40 && hotspot.latitude > 37.76 && hotspot.latitude < 37.78) || 
            (hotspot.longitude > -122.43 && hotspot.longitude < -122.41 && hotspot.latitude > 37.76 && hotspot.latitude < 37.77)))
        ) {
          adjustedIntensity *= 1.3;
        }
      } else {
        // Business district demand on weekdays
        if ((selectedCity === 'San Francisco' && hotspot.latitude > 37.78 && hotspot.longitude < -122.39)) {
          adjustedIntensity *= 1.2;
        }
        
        // Rush hour adjustments on weekdays
        if (isRushHour) {
          adjustedIntensity *= 1.3;
        }
      }
      
      // Apply time multiplier
      adjustedIntensity *= timeMultiplier;
      
      // Ensure realistic range
      adjustedIntensity = Math.max(0.3, Math.min(1.0, adjustedIntensity));
      
      // Generate points based on hotspot
      const pointsInHotspot = Math.floor(hotspot.radius * 150);
      
      for (let i = 0; i < pointsInHotspot; i++) {
        // Create deterministic point offset
        const seed = `${selectedCity}-${hotspot.longitude}-${hotspot.latitude}-${i}-${selectedDate.getDate()}`;
        const hashValue = hashCode(seed);
        
        // Calculate point position with controlled randomness
        const angle = (hashValue % 1000) / 1000 * Math.PI * 2;
        const distance = Math.sqrt((hashValue % 10000) / 10000) * hotspot.radius;
        
        const longitude = hotspot.longitude + Math.cos(angle) * distance * 0.015;
        const latitude = hotspot.latitude + Math.sin(angle) * distance * 0.015;
        
        // Only add points on land
        if (isPointOnLand(longitude, latitude)) {
          // Calculate value based on distance from center and some variation
          const distanceFactor = 1 - (distance / hotspot.radius);
          const variation = ((hashValue % 1000) / 1000) * 0.3 - 0.15; // -0.15 to 0.15 variation
          
          let pointValue = adjustedIntensity * distanceFactor + variation;
          pointValue = Math.max(0.1, Math.min(1.0, pointValue));
          
          points.push({
            position: [longitude, latitude],
            value: pointValue
          });
        }
      }
    });
    
    return points;
  }, [selectedCity, selectedDate, timeframe, isPointOnLand]);

  // Update heatmap data when dependencies change
  useEffect(() => {
    setHeatmapData(generateHeatmapPoints());
  }, [generateHeatmapPoints]);

  // Memoized layers to prevent unnecessary re-renders
  const layers = useMemo(() => [
    new HexagonLayer({
      id: 'heatmap-layer',
      data: heatmapData,
      pickable: true,
      extruded: true,
      radius: 75,
      elevationScale: 4,
      getPosition: (d: HeatmapPoint) => d.position,
      getElevationWeight: (d: HeatmapPoint) => d.value * 10,
      getColorWeight: (d: HeatmapPoint) => d.value * 10,
      colorRange: [
        [65, 182, 196, 180],  // Light blue
        [127, 205, 187, 180], // Teal
        [199, 233, 180, 200], // Light green
        [237, 248, 177, 200], // Yellow
        [255, 170, 0, 220],   // Orange
        [255, 87, 51, 255]    // Red
      ],
      coverage: 0.9,
      upperPercentile: 90
    }),
    new ScatterplotLayer({
      id: 'highlight-layer',
      data: heatmapData.filter(d => d.value > 0.75),
      pickable: true,
      opacity: 0.8,
      stroked: true,
      filled: true,
      radiusScale: 6,
      radiusMinPixels: 3,
      radiusMaxPixels: 15,
      lineWidthMinPixels: 1,
      getPosition: (d: HeatmapPoint) => d.position,
      getRadius: (d: HeatmapPoint) => d.value * 20,
      getFillColor: (d: HeatmapPoint) => [255, 140, 0, 200],
      getLineColor: (d: HeatmapPoint) => [255, 140, 0, 80]
    })
  ], [heatmapData]);

  // Handle city change with view transition
  const handleCityChange = useCallback((params: { value: Value }) => {
    if (params.value && params.value.length > 0) {
      const newCity = params.value[0].label as string;
      const cityData = US_CITIES.find(city => city.name === newCity);

      if (cityData && newCity !== selectedCity) {
        setSelectedCity(newCity);

        // Update view state with proper typing
        const newViewState: ViewState = {
          ...viewStateRef.current,
          longitude: cityData.longitude,
          latitude: cityData.latitude,
          zoom: cityData.zoom,
          transitionDuration: 1000,
          transitionInterpolator: new FlyToInterpolator()
        };
        
        viewStateRef.current = newViewState;
      }
    }
  }, [selectedCity]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((params: { value: Value }) => {
    setTimeframe(params.value);
  }, []);

  return (
    <div className={css({ width: '100%', maxWidth: '100%' })}>
      <CardWrapper title={`Driver Demand for ${selectedCity}`} subtitle="Real-time demand heatmap">
        <div className={css({ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' })}>
          <Select
            options={US_CITIES.map(city => ({ id: city.name, label: city.name }))}
            value={[{ id: selectedCity, label: selectedCity }]}
            onChange={handleCityChange}
            overrides={{
              ControlContainer: {
                style: {
                  width: '200px'
                }
              }
            }}
          />
          
          <Select
            options={[
              { id: '1', label: 'Next Hour' },
              { id: '2', label: 'Next 3 Hours' },
              { id: '3', label: 'Next 6 Hours' }
            ]}
            value={timeframe}
            placeholder="Select Timeframe"
            onChange={handleTimeframeChange}
            overrides={{
              ControlContainer: {
                style: {
                  width: '150px'
                }
              }
            }}
          />
          
          <Button 
            onClick={() => console.log('Go online clicked')}
            variant="primary"
          >
            Go Online
          </Button>
        </div>

        <div className={css({ height: '400px', position: 'relative', borderRadius: '8px', overflow: 'hidden' })}>
          {loading ? (
            <div className={css({ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '100%',
              backgroundColor: 'var(--map-dark-blue, #1a1b29)'
            })}>
              <Spinner size="large" />
            </div>
          ) : error ? (
            <div className={css({
              padding: '40px',
              textAlign: 'center',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(230, 0, 0, 0.1)'
            })}>
              <p>Error loading heatmap data. Using mock data instead.</p>
            </div>
          ) : (
            <DeckGL 
              initialViewState={viewStateRef.current} 
              controller={true}
              layers={layers}
              getTooltip={({object}: any) => object && `Demand: ${Math.round(object.colorValue * 10) / 10}`}
            >
              <Map 
                mapLib={maplibregl} 
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" 
                reuseMaps
              />
              
              {/* Map Legend */}
              <div className={css({
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                padding: '8px 12px',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                zIndex: 100
              })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '8px' })}>
                  <div className={css({ width: '12px', height: '12px', backgroundColor: 'rgb(255, 87, 51)', borderRadius: '2px' })} />
                  <span>High Demand</span>
                </div>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '8px' })}>
                  <div className={css({ width: '12px', height: '12px', backgroundColor: 'rgb(255, 170, 0)', borderRadius: '2px' })} />
                  <span>Medium Demand</span>
                </div>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '8px' })}>
                  <div className={css({ width: '12px', height: '12px', backgroundColor: 'rgb(127, 205, 187)', borderRadius: '2px' })} />
                  <span>Low Demand</span>
                </div>
              </div>
            </DeckGL>
          )}
        </div>
      </CardWrapper>
    </div>
  );
};

// Helper function to create a hash code from a string for deterministic randomness
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export default DriverHeatmap;