import React, { useState, useEffect, useRef } from 'react';
import { HeadingMedium, ParagraphSmall } from 'baseui/typography';
import { useStyletron } from 'baseui';
import { Select, Value } from 'baseui/select';
import { useQuery } from '@apollo/client';
import { GET_DRIVER_HEATMAP_DATA } from '../../graphql/queries';
import { StyledSpinnerNext as Spinner } from 'baseui/spinner';
import CardWrapper from '../common/CardWrapper';
import Button from '../common/Button';
import BottomSheet from '../common/BottomSheet';
import Legend from '../common/Legend';
import DeckGL from '@deck.gl/react';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
// Fix the import for react-map-gl by using the correct export path
import { Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { format } from 'date-fns';

// Bay Area coordinates (centered between SF and Oakland)
const INITIAL_VIEW_STATE = {
  longitude: -122.2712,
  latitude: 37.7750,
  zoom: 10,
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
  const deckRef = useRef(null);
  
  // Width and height for the heatmap
  const width = 600;
  const height = 400;
  
  // Function to check if a point is on land (not in water)
  const isPointOnLand = (longitude: number, latitude: number): boolean => {
    // Define specific land areas as polygons (simplified rectangles)
    const landAreas = [
      // San Francisco
      {
        name: "San Francisco",
        minLong: -122.52,
        maxLong: -122.35,
        minLat: 37.70,
        maxLat: 37.83
      },
      // Oakland/Berkeley
      {
        name: "Oakland/Berkeley",
        minLong: -122.35,
        maxLong: -122.20,
        minLat: 37.72,
        maxLat: 37.89
      },
      // Alameda Island
      {
        name: "Alameda",
        minLong: -122.31,
        maxLong: -122.24,
        minLat: 37.73,
        maxLat: 37.79
      },
      // South SF / Daly City
      {
        name: "South SF",
        minLong: -122.47,
        maxLong: -122.38,
        minLat: 37.63,
        maxLat: 37.70
      },
      // San Mateo
      {
        name: "San Mateo",
        minLong: -122.35,
        maxLong: -122.27,
        minLat: 37.53,
        maxLat: 37.58
      },
      // Redwood City
      {
        name: "Redwood City",
        minLong: -122.25,
        maxLong: -122.18,
        minLat: 37.47,
        maxLat: 37.53
      },
      // Palo Alto
      {
        name: "Palo Alto",
        minLong: -122.20,
        maxLong: -122.10,
        minLat: 37.38,
        maxLat: 37.46
      },
      // Mountain View
      {
        name: "Mountain View",
        minLong: -122.12,
        maxLong: -122.05,
        minLat: 37.36,
        maxLat: 37.42
      },
      // Sunnyvale
      {
        name: "Sunnyvale",
        minLong: -122.07,
        maxLong: -121.98,
        minLat: 37.35,
        maxLat: 37.41
      },
      // Santa Clara
      {
        name: "Santa Clara",
        minLong: -122.00,
        maxLong: -121.92,
        minLat: 37.33,
        maxLat: 37.39
      },
      // San Jose
      {
        name: "San Jose",
        minLong: -121.95,
        maxLong: -121.85,
        minLat: 37.30,
        maxLat: 37.38
      },
      // Fremont
      {
        name: "Fremont",
        minLong: -122.05,
        maxLong: -121.95,
        minLat: 37.50,
        maxLat: 37.58
      },
      // Hayward
      {
        name: "Hayward",
        minLong: -122.12,
        maxLong: -122.02,
        minLat: 37.62,
        maxLat: 37.68
      }
    ];
    
    // Check if the point is within any of the defined land areas
    for (const area of landAreas) {
      if (
        longitude >= area.minLong && 
        longitude <= area.maxLong && 
        latitude >= area.minLat && 
        latitude <= area.maxLat
      ) {
        return true;
      }
    }
    
    // If not in any defined land area, assume it's water
    return false;
  };
  
  // Generate more realistic mock data
  useEffect(() => {
    const generateMockData = () => {
      // Create a realistic pattern for San Francisco
      const mockData: HeatmapPoint[] = [];
      
      // Use the date to seed randomness
      const dateNum = selectedDate.getDate() + selectedDate.getMonth() * 31;
      const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
      const isHoliday = dateNum % 10 === 0; // Every 10th day is a "holiday"
      const isRainy = dateNum % 7 === 0; // Every 7th day is "rainy"
      
      // Define Bay Area neighborhoods and landmarks
      const bayAreaHotspots = [
        // San Francisco
        { 
          name: "Financial District",
          longitude: -122.399,
          latitude: 37.794,
          intensity: isWeekend ? 0.6 : 0.9, 
          radius: isWeekend ? 0.3 : 0.4 
        },
        { 
          name: "Mission District",
          longitude: -122.418,
          latitude: 37.763,
          intensity: isWeekend ? 0.9 : 0.7, 
          radius: isWeekend ? 0.25 : 0.25 
        },
        { 
          name: "SoMa",
          longitude: -122.401,
          latitude: 37.778,
          intensity: isHoliday ? 0.95 : 0.8, 
          radius: isHoliday ? 0.45 : 0.35 
        },
        { 
          name: "Fisherman's Wharf",
          longitude: -122.409,
          latitude: 37.806,
          intensity: isWeekend || isHoliday ? 0.85 : 0.7, 
          radius: isWeekend ? 0.35 : 0.25 
        },
        { 
          name: "Marina",
          longitude: -122.437,
          latitude: 37.803,
          intensity: isRainy ? 0.5 : 0.8,  
          radius: isRainy ? 0.2 : 0.3 
        },
        { 
          name: "Salesforce Tower",
          longitude: -122.396,
          latitude: 37.789,
          intensity: isWeekend ? 0.6 : 0.85, 
          radius: isWeekend ? 0.2 : 0.3 
        },
        { 
          name: "Oracle Park",
          longitude: -122.389,
          latitude: 37.778,
          intensity: (dateNum % 3 === 0) ? 0.9 : 0.7, 
          radius: (dateNum % 3 === 0) ? 0.4 : 0.25 
        },
        { 
          name: "Alamo Square",
          longitude: -122.434,
          latitude: 37.776,
          intensity: isWeekend ? 0.8 : 0.6, 
          radius: isWeekend ? 0.3 : 0.2 
        },
        {
          name: "Union Square",
          longitude: -122.407,
          latitude: 37.788,
          intensity: isWeekend ? 0.85 : 0.75,
          radius: 0.25
        },
        {
          name: "Chinatown",
          longitude: -122.406,
          latitude: 37.795,
          intensity: isWeekend ? 0.8 : 0.7,
          radius: 0.2
        },
        {
          name: "Golden Gate Park",
          longitude: -122.481,
          latitude: 37.769,
          intensity: isWeekend ? 0.75 : 0.4,
          radius: isWeekend ? 0.5 : 0.3
        },
        {
          name: "Haight-Ashbury",
          longitude: -122.446,
          latitude: 37.770,
          intensity: isWeekend ? 0.7 : 0.5,
          radius: 0.25
        },
        
        // Oakland
        {
          name: "Downtown Oakland",
          longitude: -122.271,
          latitude: 37.804,
          intensity: isWeekend ? 0.6 : 0.8,
          radius: isWeekend ? 0.25 : 0.35
        },
        {
          name: "Jack London Square",
          longitude: -122.278,
          latitude: 37.794,
          intensity: isWeekend ? 0.75 : 0.6,
          radius: 0.3
        },
        {
          name: "Oakland Airport",
          longitude: -122.212,
          latitude: 37.721,
          intensity: 0.7,
          radius: 0.4
        },
        {
          name: "Lake Merritt",
          longitude: -122.259,
          latitude: 37.807,
          intensity: isWeekend ? 0.7 : 0.5,
          radius: 0.3
        },
        
        // Berkeley
        {
          name: "UC Berkeley",
          longitude: -122.259,
          latitude: 37.872,
          intensity: isWeekend ? 0.5 : 0.8,
          radius: 0.35
        },
        {
          name: "Downtown Berkeley",
          longitude: -122.268,
          latitude: 37.871,
          intensity: isWeekend ? 0.65 : 0.75,
          radius: 0.3
        },
        
        // San Jose
        {
          name: "Downtown San Jose",
          longitude: -121.889,
          latitude: 37.335,
          intensity: isWeekend ? 0.6 : 0.8,
          radius: 0.4
        },
        {
          name: "San Jose Airport",
          longitude: -121.929,
          latitude: 37.363,
          intensity: 0.75,
          radius: 0.4
        },
        {
          name: "Santana Row",
          longitude: -121.947,
          latitude: 37.321,
          intensity: isWeekend ? 0.85 : 0.7,
          radius: 0.3
        },
        
        // Palo Alto / Silicon Valley
        {
          name: "Stanford University",
          longitude: -122.170,
          latitude: 37.428,
          intensity: isWeekend ? 0.5 : 0.7,
          radius: 0.35
        },
        {
          name: "Palo Alto Downtown",
          longitude: -122.163,
          latitude: 37.444,
          intensity: isWeekend ? 0.6 : 0.8,
          radius: 0.3
        },
        {
          name: "Mountain View",
          longitude: -122.083,
          latitude: 37.386,
          intensity: isWeekend ? 0.5 : 0.75,
          radius: 0.35
        },
        {
          name: "Cupertino",
          longitude: -122.032,
          latitude: 37.323,
          intensity: isWeekend ? 0.5 : 0.7,
          radius: 0.3
        }
      ];
      
      // Add date-specific hotspots
      if (dateNum % 5 === 0) {
        // Special event at Civic Center
        bayAreaHotspots.push({
          name: "Civic Center Event",
          longitude: -122.419,
          latitude: 37.779,
          intensity: 0.95,
          radius: 0.45
        });
      }
      
      if (selectedDate.getDay() === 5) {
        // Friday night in the Castro
        bayAreaHotspots.push({
          name: "Castro Nightlife",
          longitude: -122.435,
          latitude: 37.762,
          intensity: 0.9,
          radius: 0.35
        });
        
        // Friday night in Downtown Oakland
        bayAreaHotspots.push({
          name: "Oakland Nightlife",
          longitude: -122.268,
          latitude: 37.806,
          intensity: 0.85,
          radius: 0.3
        });
      }
      
      // Add special events based on date
      if (selectedDate.getDate() % 3 === 0) {
        // Concert at Chase Center
        bayAreaHotspots.push({
          name: "Chase Center Event",
          longitude: -122.387,
          latitude: 37.768,
          intensity: 0.95,
          radius: 0.4
        });
        
        // Event at SAP Center (San Jose)
        bayAreaHotspots.push({
          name: "SAP Center Event",
          longitude: -121.901,
          latitude: 37.332,
          intensity: 0.9,
          radius: 0.4
        });
      }
      
      if (selectedDate.getDate() % 7 === 0) {
        // Festival at Golden Gate Park
        bayAreaHotspots.push({
          name: "Golden Gate Park Festival",
          longitude: -122.481,
          latitude: 37.769,
          intensity: 0.9,
          radius: 0.5
        });
        
        // Event at Oakland Coliseum
        bayAreaHotspots.push({
          name: "Oakland Coliseum Event",
          longitude: -122.201,
          latitude: 37.752,
          intensity: 0.9,
          radius: 0.45
        });
      }
      
      // Add time-based variation based on selected timeframe
      const selectedTimeframeValue = timeframe && timeframe.length > 0 ? String(timeframe[0]?.label || '') : 'Next Hour';
      const timeMultiplier = selectedTimeframeValue.includes('Hour') || selectedTimeframeValue.includes('hour') ? 1 : 
                            selectedTimeframeValue.includes('3') ? 0.8 : 0.6;
      
      // Generate points around hotspots
      bayAreaHotspots.forEach(hotspot => {
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
      const lowDemandPoints = 400; // Increased for larger area
      let pointsAdded = 0;
      let attempts = 0;
      const maxAttempts = 1000; // Prevent infinite loops
      
      while (pointsAdded < lowDemandPoints && attempts < maxAttempts) {
        attempts++;
        
        // Randomly select which region to place the point
        const region = Math.floor(Math.random() * 4);
        let longitude, latitude;
        
        switch(region) {
          case 0: // San Francisco - more precise boundaries
            longitude = -122.47 + Math.random() * 0.08;
            latitude = 37.75 + Math.random() * 0.06;
            break;
          case 1: // Oakland/Berkeley - more precise boundaries
            longitude = -122.30 + Math.random() * 0.08;
            latitude = 37.80 + Math.random() * 0.06;
            break;
          case 2: // Peninsula
            longitude = -122.40 + Math.random() * 0.10;
            latitude = 37.55 + Math.random() * 0.10;
            break;
          case 3: // South Bay
            longitude = -122.00 + Math.random() * 0.15;
            latitude = 37.35 + Math.random() * 0.10;
            break;
          default:
            longitude = -122.25 + Math.random() * 0.30;
            latitude = 37.60 + Math.random() * 0.30;
        }
        
        // Only add the point if it's on land
        if (isPointOnLand(longitude, latitude)) {
          mockData.push({
            position: [longitude, latitude] as [number, number],
            value: Math.random() * 0.3
          });
          pointsAdded++;
        }
      }
      
      // Add some points along major roads
      const bayAreaMajorRoads = [
        // San Francisco
        { name: "Market Street", start: [-122.42, 37.774], end: [-122.396, 37.794] },
        { name: "Van Ness Ave", start: [-122.422, 37.74], end: [-122.422, 37.79] },
        { name: "Geary Blvd", start: [-122.45, 37.781], end: [-122.39, 37.781] },
        { name: "Mission Street", start: [-122.42, 37.765], end: [-122.405, 37.79] },
        { name: "3rd Street", start: [-122.4, 37.77], end: [-122.39, 37.78] },
        { name: "Embarcadero", start: [-122.395, 37.77], end: [-122.395, 37.79] },
        { name: "19th Avenue", start: [-122.476, 37.75], end: [-122.476, 37.78] },
        { name: "Divisadero", start: [-122.439, 37.77], end: [-122.439, 37.8] },
        { name: "California Street", start: [-122.45, 37.788], end: [-122.4, 37.788] },
        
        // Oakland/Berkeley
        { name: "Broadway Oakland", start: [-122.271, 37.79], end: [-122.255, 37.83] },
        { name: "Telegraph Ave", start: [-122.268, 37.81], end: [-122.258, 37.87] },
        { name: "International Blvd", start: [-122.24, 37.75], end: [-122.16, 37.73] },
        { name: "Grand Ave", start: [-122.265, 37.81], end: [-122.245, 37.815] },
        { name: "Shattuck Ave", start: [-122.268, 37.85], end: [-122.266, 37.88] },
        
        // Peninsula/South Bay
        { name: "El Camino Real", start: [-122.40, 37.65], end: [-121.92, 37.35] },
        { name: "Stevens Creek Blvd", start: [-122.05, 37.32], end: [-121.94, 37.32] },
        { name: "San Carlos St", start: [-121.91, 37.33], end: [-121.86, 37.34] },
        { name: "University Ave PA", start: [-122.17, 37.44], end: [-122.14, 37.45] },
        
        // Major Highways
        { name: "101 North", start: [-122.40, 37.6], end: [-122.39, 37.8] },
        { name: "101 South", start: [-122.07, 37.35], end: [-121.85, 37.30] },
        { name: "280", start: [-122.40, 37.6], end: [-121.95, 37.33] },
        { name: "880", start: [-122.30, 37.65], end: [-122.17, 37.85] },
        { name: "580", start: [-122.30, 37.8], end: [-122.15, 37.7] }
      ];
      
      const roadPoints = 300; // Increased for larger area
      let roadPointsAdded = 0;
      attempts = 0;
      
      while (roadPointsAdded < roadPoints && attempts < maxAttempts) {
        attempts++;
        
        const road = bayAreaMajorRoads[Math.floor(Math.random() * bayAreaMajorRoads.length)];
        const t = Math.random();
        const longitude = road.start[0] + (road.end[0] - road.start[0]) * t;
        const latitude = road.start[1] + (road.end[1] - road.start[1]) * t;
        
        // Double-check that the point is on land
        if (isPointOnLand(longitude, latitude)) {
          mockData.push({
            position: [longitude, latitude] as [number, number],
            value: 0.3 + Math.random() * 0.3
          });
          roadPointsAdded++;
        }
      }
      
      return mockData;
    };
    
    setHeatmapData(generateMockData());
  }, [timeframe, selectedDate]);
  
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
  
  // Handle view state changes
  const handleViewStateChange = (info: ViewStateChangeInfo) => {
    setViewState(info.viewState);
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

  return (
    <div className={css({
      fontFamily: 'var(--font-family-base)',
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden'
    })}>
      <CardWrapper 
        title={getDateSpecificTitle()} 
        subtitle="Real-time demand across the Bay Area"
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
            margin: 0,
            fontSize: 'var(--font-size-heading-small)',
            fontWeight: 700,
            color: 'var(--dark-gray)'
          })}>
            San Francisco
          </h3>
          
          <Select
            options={[
              { id: '1', label: 'Next Hour' },
              { id: '2', label: 'Next 3 Hours' },
              { id: '3', label: 'Next 6 Hours' }
            ]}
            value={timeframe}
            onChange={params => setTimeframe(params.value)}
            overrides={{
              Root: {
                style: {
                  borderRadius: '8px',
                  border: '1px solid var(--medium-gray)',
                }
              },
              ControlContainer: {
                style: {
                  backgroundColor: 'var(--uber-white)',
                  borderRadius: '8px',
                }
              },
              ValueContainer: {
                style: {
                  fontSize: 'var(--font-size-body)',
                  fontFamily: 'var(--font-family-base)',
                }
              },
              Dropdown: {
                style: {
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px var(--shadow-color)',
                }
              }
            }}
          />
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