import React, { useState, useEffect, useRef } from 'react';
import { useStyletron } from 'baseui';
import { Select, Value } from 'baseui/select';
import { useQuery } from '@apollo/client';
import { GET_DRIVER_HEATMAP_DATA } from '../../graphql/queries';
import { StyledSpinnerNext as Spinner } from 'baseui/spinner';
import CardWrapper from '../common/CardWrapper';
import Button from '../common/Button';
import BottomSheet from '../common/BottomSheet';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FlyToInterpolator } from '@deck.gl/core';

// Define major US cities with their coordinates
const US_CITIES = [
  { name: "San Francisco", longitude: -122.4194, latitude: 37.7749, zoom: 12 },
  { name: "New York", longitude: -74.0060, latitude: 40.7128, zoom: 12 },
  { name: "Los Angeles", longitude: -118.2437, latitude: 34.0522, zoom: 11 },
  { name: "Chicago", longitude: -87.6298, latitude: 41.8781, zoom: 11 },
  { name: "Miami", longitude: -80.1918, latitude: 25.7617, zoom: 12 },
  { name: "Seattle", longitude: -122.3321, latitude: 47.6062, zoom: 12 },
  { name: "Austin", longitude: -97.7431, latitude: 30.2672, zoom: 12 },
  { name: "Boston", longitude: -71.0589, latitude: 42.3601, zoom: 13 },
  { name: "Denver", longitude: -104.9903, latitude: 39.7392, zoom: 12 },
  { name: "Washington DC", longitude: -77.0369, latitude: 38.9072, zoom: 12 }
];

// Add a "View All Cities" option
const ALL_CITIES_OPTION = {
  name: "All Cities",
  longitude: -98.5795, // Center of US
  latitude: 39.8283,
  zoom: 4
};

// Default to San Francisco
const DEFAULT_CITY = US_CITIES[0];

// Initial view state based on default city
const INITIAL_VIEW_STATE = {
  longitude: DEFAULT_CITY.longitude,
  latitude: DEFAULT_CITY.latitude,
  zoom: DEFAULT_CITY.zoom,
  pitch: 45,
  bearing: 0
};

interface HeatmapPoint {
  position: [number, number];
  value: number;
}

interface DriverHeatmapProps {
  selectedDate?: Date;
}

// Define the ViewState type
interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  [key: string]: any;
}

// Define the ViewStateChangeInfo type
interface ViewStateChangeInfo {
  viewState: ViewState;
  interactionState?: any;
  oldViewState?: ViewState;
}

const DriverHeatmap: React.FC<DriverHeatmapProps> = ({ selectedDate = new Date() }) => {
  const [css] = useStyletron();
  const [timeframe, setTimeframe] = useState<Value>([{ id: '1', label: 'Next Hour' }]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [selectedCity, setSelectedCity] = useState<string>(DEFAULT_CITY.name);
  const [showAllCities, setShowAllCities] = useState<boolean>(false);
  const deckRef = useRef(null);
  
  // Height for the heatmap (removed unused width variable)
  const height = 400;
  
  // Function to check if a point is on land (not in water)
  const isPointOnLand = (longitude: number, latitude: number): boolean => {
    // City-specific water boundaries
    const waterBoundaries: Record<string, (lon: number, lat: number) => boolean> = {
      "San Francisco": (lon, lat) => {
        // Pacific Ocean (West of the Bay Area)
        if (lon <= -122.52) return false;
        
        // Central Bay
        if (lon >= -122.52 && lon <= -122.15 && 
            lat >= 37.70 && lat <= 37.90) {
          // San Francisco Peninsula
          if (lon <= -122.38 && lat >= 37.70 && lat <= 37.83) {
            return true;
          }
          
          // Oakland/Berkeley/Alameda
          if (lon >= -122.32 && lon <= -122.20 && 
              lat >= 37.73 && lat <= 37.88) {
            return true;
          }
          
          // Treasure Island
          if (lon >= -122.38 && lon <= -122.36 && 
              lat >= 37.81 && lat <= 37.83) {
            return true;
          }
          
          // Default to water for the central bay
          return false;
        }
        
        return true;
      },
      "New York": (lon, lat) => {
        // Atlantic Ocean
        if (lon <= -74.05 && lat <= 40.60) return false;
        
        // East River
        if (lon >= -74.02 && lon <= -73.92 && 
            lat >= 40.70 && lat <= 40.80) return false;
        
        // Hudson River
        if (lon >= -74.02 && lon <= -73.98 && 
            lat >= 40.70 && lat <= 40.85) return false;
        
        return true;
      },
      "Chicago": (lon, lat) => {
        // Lake Michigan
        if (lon >= -87.65 && lat >= 41.85) return false;
        
        return true;
      },
      "Miami": (lon, lat) => {
        // Atlantic Ocean
        if (lon >= -80.12 && lat <= 25.76) return false;
        
        // Biscayne Bay
        if (lon >= -80.20 && lon <= -80.15 && 
            lat >= 25.75 && lat <= 25.85) return false;
        
        return true;
      }
    };
    
    // Use city-specific water detection if available
    if (waterBoundaries[selectedCity]) {
      return waterBoundaries[selectedCity](longitude, latitude);
    }
    
    // Default land detection for cities without specific water boundaries
    return true;
  };
  
  // Generate more realistic mock data
  useEffect(() => {
    const generateMockData = () => {
      const mockData: HeatmapPoint[] = [];
      
      // Use the date to seed randomness
      const dateNum = selectedDate.getDate() + selectedDate.getMonth() * 31;
      const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
      const isHoliday = dateNum % 10 === 0; // Every 10th day is a "holiday"
      const isRainy = dateNum % 7 === 0; // Every 7th day is "rainy"
      
      // If showing all cities or zoomed out enough, generate data for all cities
      if (showAllCities || viewState.zoom < 6) {
        // Generate data for all cities
        US_CITIES.forEach(city => {
          // Generate hotspots for this city
          generateCityHotspots(city.name, city.longitude, city.latitude, mockData, {
            dateNum,
            isWeekend,
            isHoliday,
            isRainy
          });
        });
      } else {
        // Generate data just for the selected city
        const selectedCityData = US_CITIES.find(city => city.name === selectedCity) || DEFAULT_CITY;
        generateCityHotspots(selectedCity, selectedCityData.longitude, selectedCityData.latitude, mockData, {
          dateNum,
          isWeekend,
          isHoliday,
          isRainy
        });
      }
      
      return mockData;
    };
    
    // Helper function to generate hotspots for a specific city
    const generateCityHotspots = (
      cityName: string, 
      cityLongitude: number, 
      cityLatitude: number, 
      mockData: HeatmapPoint[],
      conditions: {
        dateNum: number,
        isWeekend: boolean,
        isHoliday: boolean,
        isRainy: boolean
      }
    ) => {
      const { dateNum, isWeekend, isHoliday, isRainy } = conditions;
      
      // Define city-specific hotspots
      const cityHotspots: Record<string, any[]> = {
        "San Francisco": [
          // Financial District
          { 
            name: "Financial District",
            longitude: -122.399,
            latitude: 37.794,
            intensity: isRainy ? 0.7 : 1.0,
            radius: isWeekend ? 0.3 : 0.4 
          },
          // Mission District
          { 
            name: "Mission District",
            longitude: -122.418,
            latitude: 37.763,
            intensity: isWeekend ? 0.9 : 0.7, 
            radius: isWeekend ? 0.25 : 0.25 
          },
          // SoMa
          { 
            name: "SoMa",
            longitude: -122.401,
            latitude: 37.778,
            intensity: isHoliday ? 0.95 : 0.8, 
            radius: isHoliday ? 0.45 : 0.35 
          },
          // More SF hotspots...
        ],
        "New York": [
          // Times Square
          {
            name: "Times Square",
            longitude: -73.9855,
            latitude: 40.7580,
            intensity: isWeekend ? 0.9 : 0.8,
            radius: 0.3
          },
          // Financial District
          {
            name: "Financial District",
            longitude: -74.0090,
            latitude: 40.7075,
            intensity: isWeekend ? 0.5 : 0.9,
            radius: isWeekend ? 0.2 : 0.4
          },
          // Central Park
          {
            name: "Central Park",
            longitude: -73.9665,
            latitude: 40.7812,
            intensity: isWeekend ? 0.8 : 0.6,
            radius: isWeekend ? 0.4 : 0.3
          },
          // Brooklyn Heights
          {
            name: "Brooklyn Heights",
            longitude: -73.9938,
            latitude: 40.6975,
            intensity: isWeekend ? 0.7 : 0.6,
            radius: 0.3
          }
        ],
        "Los Angeles": [
          // Downtown LA
          {
            name: "Downtown LA",
            longitude: -118.2437,
            latitude: 34.0522,
            intensity: isWeekend ? 0.7 : 0.9,
            radius: 0.4
          },
          // Hollywood
          {
            name: "Hollywood",
            longitude: -118.3287,
            latitude: 34.0928,
            intensity: isWeekend ? 0.9 : 0.7,
            radius: 0.35
          },
          // Santa Monica
          {
            name: "Santa Monica",
            longitude: -118.4912,
            latitude: 34.0195,
            intensity: isWeekend ? 0.85 : 0.7,
            radius: 0.3
          },
          // LAX
          {
            name: "LAX",
            longitude: -118.4085,
            latitude: 33.9416,
            intensity: 0.8,
            radius: 0.4
          }
        ],
        "Chicago": [
          // The Loop
          {
            name: "The Loop",
            longitude: -87.6298,
            latitude: 41.8781,
            intensity: isWeekend ? 0.6 : 0.9,
            radius: isWeekend ? 0.3 : 0.4
          },
          // Magnificent Mile
          {
            name: "Magnificent Mile",
            longitude: -87.6251,
            latitude: 41.8932,
            intensity: isWeekend ? 0.8 : 0.7,
            radius: 0.3
          },
          // Wrigleyville
          {
            name: "Wrigleyville",
            longitude: -87.6553,
            latitude: 41.9484,
            intensity: isWeekend ? 0.9 : 0.6,
            radius: isWeekend ? 0.4 : 0.2
          }
        ],
        "Miami": [
          // South Beach
          {
            name: "South Beach",
            longitude: -80.1340,
            latitude: 25.7825,
            intensity: isWeekend ? 0.95 : 0.8,
            radius: isWeekend ? 0.4 : 0.3
          },
          // Downtown Miami
          {
            name: "Downtown Miami",
            longitude: -80.1918,
            latitude: 25.7743,
            intensity: isWeekend ? 0.7 : 0.9,
            radius: isWeekend ? 0.3 : 0.4
          },
          // Miami Airport
          {
            name: "Miami Airport",
            longitude: -80.2870,
            latitude: 25.7953,
            intensity: 0.8,
            radius: 0.4
          }
        ]
      };
      
      // Get hotspots for the city or use default
      const hotspots = cityHotspots[cityName] || [
        // Default hotspot for cities without specific data
        {
          name: `${cityName} Downtown`,
          longitude: cityLongitude,
          latitude: cityLatitude,
          intensity: isWeekend ? 0.8 : 0.9,
          radius: 0.4
        },
        // Airport hotspot
        {
          name: `${cityName} Airport`,
          longitude: cityLongitude + 0.05,
          latitude: cityLatitude - 0.05,
          intensity: 0.7,
          radius: 0.3
        }
      ];
      
      // Add date-specific hotspots
      if (dateNum % 5 === 0) {
        // Special event
        hotspots.push({
          name: `${cityName} Event`,
          longitude: cityLongitude + 0.01,
          latitude: cityLatitude + 0.01,
          intensity: 0.95,
          radius: 0.4
        });
      }
      
      // Add time-based variation based on selected timeframe
      const selectedTimeframeValue = timeframe && timeframe.length > 0 ? String(timeframe[0]?.label || '') : 'Next Hour';
      const timeMultiplier = selectedTimeframeValue.includes('Hour') || selectedTimeframeValue.includes('hour') ? 1 : 
                            selectedTimeframeValue.includes('3') ? 0.8 : 0.6;
      
      // Generate points around hotspots
      hotspots.forEach(hotspot => {
        // Adjust intensity based on time of day
        const adjustedIntensity = hotspot.intensity * timeMultiplier;
        
        // Create dense cluster at the center of each hotspot
        const centerLongitude = hotspot.longitude + (Math.random() * 0.002 - 0.001);
        const centerLatitude = hotspot.latitude + (Math.random() * 0.002 - 0.001);
        
        // Only add the point if it's on land
        if (isPointOnLand(centerLongitude, centerLatitude)) {
          const centerPoint = {
            position: [centerLongitude, centerLatitude] as [number, number],
            value: adjustedIntensity * (0.9 + Math.random() * 0.2)
          };
          mockData.push(centerPoint);
        }
        
        // Create surrounding points with decreasing intensity
        const pointsInCluster = Math.floor(hotspot.radius * 100);
        let clusterPointsAdded = 0;
        let attempts = 0;
        const maxAttempts = 200; // Prevent infinite loops
        
        while (clusterPointsAdded < pointsInCluster && attempts < maxAttempts) {
          attempts++;
          
          const distance = Math.random() * hotspot.radius;
          const angle = Math.random() * Math.PI * 2;
          const longitude = hotspot.longitude + Math.cos(angle) * distance * 0.01;
          const latitude = hotspot.latitude + Math.sin(angle) * distance * 0.01;
          
          // Only add the point if it's on land
          if (isPointOnLand(longitude, latitude)) {
            // Intensity decreases with distance from center
            const distanceFactor = 1 - (distance / hotspot.radius);
            const value = adjustedIntensity * distanceFactor * (0.7 + Math.random() * 0.3);
            
            mockData.push({ 
              position: [longitude, latitude] as [number, number], 
              value 
            });
            clusterPointsAdded++;
          }
        }
      });
      
      // Add some random points for areas with lower demand
      const lowDemandPoints = 200; // Reduced for multiple cities
      let pointsAdded = 0;
      let attempts = 0;
      const maxAttempts = 500; // Prevent infinite loops
      
      while (pointsAdded < lowDemandPoints && attempts < maxAttempts) {
        attempts++;
        
        // Generate random point within city bounds
        const longitude = cityLongitude + (Math.random() * 0.1 - 0.05);
        const latitude = cityLatitude + (Math.random() * 0.1 - 0.05);
        
        // Only add the point if it's on land
        if (isPointOnLand(longitude, latitude)) {
          mockData.push({
            position: [longitude, latitude] as [number, number],
            value: Math.random() * 0.3
          });
          pointsAdded++;
        }
      }
    };
    
    setHeatmapData(generateMockData());
  }, [timeframe, selectedDate, selectedCity, viewState.zoom, showAllCities]);
  
  // Query for heatmap data - you can use mock data instead if your GraphQL server isn't set up
  const { loading, error, data } = useQuery(GET_DRIVER_HEATMAP_DATA, {
    skip: true, // Skip the actual GraphQL query and use mock data instead
    onError: (err) => {
      console.error("GraphQL error:", err);
      // Continue with mock data if the GraphQL query fails
    }
  });
  
  // Always use mock data for the heatmap
  const displayData = heatmapData;
  
  // Get date-specific title
  const getDateSpecificTitle = () => {
    if (selectedDate.getTime() === new Date().setHours(0, 0, 0, 0)) {
      return "Today's Driver Demand in Bay Area";
    } else if (selectedDate > new Date()) {
      return `Predicted Demand for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} in Bay Area`;
    } else {
      return `Historical Demand for ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} in Bay Area`;
    }
  };
  
  // Define layers for deck.gl
  const layers = [
    new HexagonLayer({
      id: 'heatmap-layer',
      data: displayData,
      pickable: true,
      extruded: true,
      radius: 100,
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
      upperPercentile: 90,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51]
      }
    }),
    new ScatterplotLayer({
      id: 'highlight-layer',
      data: displayData.filter(d => d.value > 0.7),
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
  ];
  
  // Update view state when it changes
  const handleViewStateChange = (info: ViewStateChangeInfo) => {
    setViewState(info.viewState);
    
    // Auto-detect if we're zoomed out enough to show all cities
    if (info.viewState.zoom < 6 && !showAllCities) {
      setShowAllCities(true);
    } else if (info.viewState.zoom >= 6 && showAllCities) {
      setShowAllCities(false);
    }
  };
  
  // Create DeckGL props to avoid TypeScript errors
  const deckGLProps = {
    ref: deckRef,
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    layers,
    getTooltip: ({object}: any) => object && `Demand: ${Math.round(object.colorValue * 10) / 10}`,
    width: "100%",
    height: "100%",
    // @ts-ignore - onViewStateChange is supported by DeckGL but not in our type definitions
    onViewStateChange: handleViewStateChange
  };

  // Add city selector
  const handleCityChange = (params: { value: Value }) => {
    if (params.value && params.value.length > 0) {
      const newCity = params.value[0].label as string;
      
      if (newCity === ALL_CITIES_OPTION.name) {
        // View all cities
        setSelectedCity(newCity);
        setShowAllCities(true);
        setViewState({
          ...viewState,
          longitude: ALL_CITIES_OPTION.longitude,
          latitude: ALL_CITIES_OPTION.latitude,
          zoom: ALL_CITIES_OPTION.zoom
        });
      } else {
        // View specific city
        const cityData = US_CITIES.find(city => city.name === newCity);
        
        if (cityData) {
          setSelectedCity(newCity);
          setShowAllCities(false);
          
          // Animate to the new city with a smooth transition
          setViewState({
            ...viewState,
            longitude: cityData.longitude,
            latitude: cityData.latitude,
            zoom: cityData.zoom,
            transitionDuration: 1000,
            transitionInterpolator: new FlyToInterpolator()
          });
        }
      }
    }
  };

  return (
    <div className={css({
      fontFamily: 'var(--font-family-base)',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    })}>
      <CardWrapper 
        title={getDateSpecificTitle()} 
        subtitle={showAllCities ? "Real-time demand across the United States" : `Real-time demand in ${selectedCity}`}
      >
        <div className={css({
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          '@media screen and (min-width: 768px)': {
            flexDirection: 'row'
          }
        })}>
          <h3 className={css({
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 'normal',
            '@media screen and (min-width: 768px)': {
              margin: '0'
            }
          })}>
            {showAllCities ? "Viewing: All Cities" : `Viewing: ${selectedCity}`}
          </h3>
          
          <div className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          })}>
            <Select
              options={[
                { id: ALL_CITIES_OPTION.name, label: ALL_CITIES_OPTION.name },
                ...US_CITIES.map(city => ({ id: city.name, label: city.name }))
              ]}
              value={[{ id: showAllCities ? ALL_CITIES_OPTION.name : selectedCity, label: showAllCities ? ALL_CITIES_OPTION.name : selectedCity }]}
              placeholder="Select City"
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
              onChange={params => setTimeframe(params.value)}
              overrides={{
                ControlContainer: {
                  style: {
                    width: '150px'
                  }
                }
              }}
            />
            
            <Button
              onClick={() => setIsInfoSheetOpen(true)}
              variant="secondary"
              size="small"
            >
              Info
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className={css({ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '40px',
            height: `${height}px`,
            backgroundColor: 'var(--map-dark-blue, #1a1b29)',
            borderRadius: '8px',
          })}>
            <Spinner size="large" />
            <span className={css({ 
              marginLeft: '12px', 
              color: 'var(--uber-white, #ffffff)',
              fontSize: 'var(--font-size-body)',
            })}>
              Loading heatmap data...
            </span>
          </div>
        ) : error ? (
          <div className={css({
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'rgba(230, 0, 0, 0.1)',
            borderRadius: '8px',
            height: `${height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          })}>
            <p className={css({ 
              color: 'var(--error, #e00000)',
              fontSize: 'var(--font-size-body)',
              margin: 0,
            })}>
              Error loading heatmap data. Using mock data instead.
            </p>
          </div>
        ) : (
          <div className={css({
            position: 'relative',
            height: '400px',
            width: '100%',
            '@media screen and (max-width: 768px)': {
              height: '300px'
            }
          })}>
            <DeckGL
              {...deckGLProps}
            >
              <Map
                mapLib={maplibregl}
                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                style={{ width: '100%', height: '100%' }}
                reuseMaps
              />
            </DeckGL>
            
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
              zIndex: 10 // Ensure it appears above the map
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
            
            <button 
              className={css({
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                backgroundColor: 'var(--uber-black, #000000)',
                color: 'var(--uber-white, #ffffff)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px var(--shadow-color, rgba(0, 0, 0, 0.2))',
                cursor: 'pointer',
                zIndex: 10,
                fontSize: 'var(--font-size-heading-small, 18px)',
                fontWeight: 700,
              })}
              onClick={() => setIsInfoSheetOpen(true)}
            >
              i
            </button>
          </div>
        )}
        
        <div className={css({ 
          marginTop: '24px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          padding: '12px',
          borderRadius: '8px',
          flexDirection: 'column',
          '@media screen and (min-width: 768px)': {
            flexDirection: 'row'
          }
        })}>
          <Button 
            variant="primary" 
            fullWidth
            onClick={() => {
              // Handle go online action
              console.log('Go online clicked');
            }}
          >
            Go Online Now
          </Button>
        </div>
      </CardWrapper>
      
      <BottomSheet 
        isOpen={isInfoSheetOpen} 
        onClose={() => setIsInfoSheetOpen(false)}
      >
        <div className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        })}>
          <h3 className={css({
            margin: 0,
            fontSize: 'var(--font-size-heading-medium, 24px)',
            fontWeight: 700
          })}>
            Demand Information
          </h3>
          
          <button 
            className={css({
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            })}
            onClick={() => setIsInfoSheetOpen(false)}
          >
            ×
          </button>
        </div>
        
        <p className={css({
          fontSize: 'var(--font-size-body, 16px)',
          lineHeight: 'var(--line-height-body, 1.5)',
          color: 'var(--dark-gray, #4A4A4A)',
          marginBottom: '24px'
        })}>
          This heatmap shows the predicted driver demand across the Bay Area for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}. 
          Darker red areas indicate higher demand, while blue areas show lower demand.
        </p>
        
        <h4 className={css({
          fontSize: 'var(--font-size-heading-small, 18px)',
          fontWeight: 600,
          marginBottom: '8px',
          marginTop: '24px'
        })}>
          Tips for Today
        </h4>
        
        <p className={css({
          fontSize: 'var(--font-size-body, 16px)',
          lineHeight: 'var(--line-height-body, 1.5)',
          color: 'var(--dark-gray, #4A4A4A)',
          marginBottom: '16px'
        })}>
          {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? (
            <>
              Weekend demand is highest in entertainment districts across the Bay Area. 
              Focus on Mission District, Marina, and Downtown Oakland in the evening. 
              Airport pickups are steady throughout the day.
              {selectedDate.getDate() % 7 === 0 && (
                <> There are special events today that will increase demand in certain areas.</>
              )}
            </>
          ) : (
            <>
              Weekday demand peaks during morning (7-9 AM) and evening (4-7 PM) commute hours.
              Financial District in SF, Downtown Oakland, and Silicon Valley office areas will be busiest.
              {selectedDate.getDate() % 3 === 0 && (
                <> There are events scheduled today that will create demand hotspots.</>
              )}
            </>
          )}
        </p>
        
        <h4 className={css({
          fontSize: 'var(--font-size-heading-small, 18px)',
          fontWeight: 600,
          marginBottom: '8px',
          marginTop: '24px'
        })}>
          Hotspots Today
        </h4>
        
        <ul className={css({
          fontSize: 'var(--font-size-body, 16px)',
          lineHeight: 'var(--line-height-body, 1.5)',
          color: 'var(--dark-gray, #4A4A4A)',
          marginBottom: '16px',
          paddingLeft: '20px'
        })}>
          {selectedDate.getDay() === 0 || selectedDate.getDay() === 6 ? (
            // Weekend hotspots
            <>
              <li>Mission District, SF - High demand for restaurants and bars</li>
              <li>Union Square, SF - Shopping and tourist activity</li>
              <li>Marina/North Beach, SF - Nightlife and dining</li>
              <li>Downtown Oakland - Weekend events and dining</li>
              <li>Berkeley - Campus area and Downtown</li>
              {selectedDate.getDate() % 7 === 0 && (
                <li>Golden Gate Park, SF - Special event creating high demand</li>
              )}
              {selectedDate.getDate() % 3 === 0 && (
                <>
                  <li>Chase Center, SF - Event creating surge demand</li>
                  <li>SAP Center, San Jose - Event creating surge demand</li>
                </>
              )}
              <li>Santana Row, San Jose - Shopping and dining</li>
              <li>SFO & OAK Airports - Consistent demand</li>
            </>
          ) : (
            // Weekday hotspots
            <>
              <li>Financial District, SF - Business commuters</li>
              <li>SoMa, SF - Tech offices and business travelers</li>
              <li>Downtown Oakland - Business district</li>
              <li>Silicon Valley - Office parks in Mountain View, Palo Alto, and Cupertino</li>
              <li>Stanford University - Campus activity</li>
              {selectedDate.getDate() % 5 === 0 && (
                <li>Civic Center, SF - Special event creating high demand</li>
              )}
              {selectedDate.getDay() === 5 && (
                <>
                  <li>Castro, SF - Friday night entertainment</li>
                  <li>Downtown Oakland - Friday night entertainment</li>
                </>
              )}
              <li>SFO, OAK & SJC Airports - Business travelers</li>
            </>
          )}
          {selectedDate.getDate() % 7 === 0 && (
            <li>Weather Alert: Rainy conditions expected - demand typically increases by 20-30%</li>
          )}
        </ul>
        
        <Button 
          variant="primary" 
          fullWidth
          onClick={() => {
            setIsInfoSheetOpen(false);
            // Handle go online action
            console.log('Go online clicked from info sheet');
          }}
        >
          Go Online Now
        </Button>
      </BottomSheet>
    </div>
  );
};

export default DriverHeatmap;