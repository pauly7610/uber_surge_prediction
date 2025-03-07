import React, { useState, useEffect } from 'react';
import { Card } from 'baseui/card';
import { HeadingMedium, ParagraphSmall } from 'baseui/typography';
import { useStyletron } from 'baseui';
import { Select, Value } from 'baseui/select';
import { useQuery } from '@apollo/client';
import { GET_DRIVER_HEATMAP_DATA } from '../../graphql/queries';
import { StyledSpinnerNext as Spinner } from 'baseui/spinner';

interface HeatmapCell {
  x: number;
  y: number;
  value: number;
}

interface HeatmapProps {
  data: HeatmapCell[];
  width: number;
  height: number;
}

// SVG map of San Francisco for background - more realistic version
const SanFranciscoMap = () => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
    <defs>
      <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0A1A2E" />
        <stop offset="100%" stopColor="#152E4D" />
      </linearGradient>
      <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1A2632" />
        <stop offset="100%" stopColor="#1E2D3A" />
      </linearGradient>
      <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      </pattern>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Background */}
    <rect width="100%" height="100%" fill="#0A1622" />
    <rect width="100%" height="100%" fill="url(#gridPattern)" />
    
    {/* Pacific Ocean */}
    <rect x="0" y="0" width="150" height="400" fill="url(#waterGradient)" />
    
    {/* San Francisco Bay */}
    <path d="M400,50 Q450,75 500,60 L600,60 L600,400 L400,400 Q380,350 400,300 Q420,250 400,200 Q380,150 400,100 Z" 
          fill="url(#waterGradient)" />
    
    {/* Main Peninsula Shape */}
    <path d="M150,0 L400,0 Q420,50 400,100 Q380,150 400,200 Q420,250 400,300 Q380,350 400,400 L150,400 Q170,350 150,300 Q130,250 150,200 Q170,150 150,100 Q130,50 150,0 Z" 
          fill="url(#landGradient)" />
    
    {/* Street Grid - Main Streets */}
    <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.7">
      {/* Horizontal Streets */}
      <line x1="150" y1="50" x2="400" y2="50" />
      <line x1="150" y1="100" x2="400" y2="100" />
      <line x1="150" y1="150" x2="400" y2="150" />
      <line x1="150" y1="200" x2="400" y2="200" />
      <line x1="150" y1="250" x2="400" y2="250" />
      <line x1="150" y1="300" x2="400" y2="300" />
      <line x1="150" y1="350" x2="400" y2="350" />
      
      {/* Vertical Streets */}
      <line x1="180" y1="0" x2="180" y2="400" />
      <line x1="210" y1="0" x2="210" y2="400" />
      <line x1="240" y1="0" x2="240" y2="400" />
      <line x1="270" y1="0" x2="270" y2="400" />
      <line x1="300" y1="0" x2="300" y2="400" />
      <line x1="330" y1="0" x2="330" y2="400" />
      <line x1="360" y1="0" x2="360" y2="400" />
    </g>
    
    {/* Major Arterial Roads */}
    <g stroke="rgba(255,255,255,0.2)" strokeWidth="1.2">
      {/* Market Street */}
      <path d="M200,100 L400,200" />
      
      {/* Van Ness */}
      <path d="M270,0 L270,400" />
      
      {/* Geary */}
      <path d="M150,120 L400,120" />
      
      {/* Mission Street */}
      <path d="M220,150 L350,250" />
      
      {/* 3rd Street */}
      <path d="M350,150 L350,400" />
      
      {/* Embarcadero */}
      <path d="M400,100 Q380,150 400,200 Q420,250 400,300" />
    </g>
    
    {/* Golden Gate Bridge */}
    <path d="M150,80 L50,60" stroke="#E74C3C" strokeWidth="2" strokeDasharray="2,2" />
    
    {/* Bay Bridge */}
    <path d="M400,150 L600,130" stroke="#F1C40F" strokeWidth="2" strokeDasharray="2,2" />
    
    {/* Neighborhoods with subtle boundaries */}
    <g fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5">
      {/* Financial District / Downtown */}
      <path d="M350,120 Q370,140 380,170 Q360,190 330,180 Q320,150 350,120" />
      
      {/* SoMa */}
      <path d="M330,180 Q360,190 380,220 Q350,250 320,230 Q310,200 330,180" />
      
      {/* Mission */}
      <path d="M280,200 Q310,190 320,230 Q300,260 270,250 Q260,220 280,200" />
      
      {/* Marina */}
      <path d="M200,80 Q230,70 260,90 Q240,120 210,110 Q190,100 200,80" />
      
      {/* North Beach */}
      <path d="M260,90 Q290,80 310,100 Q290,130 260,120 Q240,110 260,90" />
      
      {/* Haight-Ashbury */}
      <path d="M220,170 Q250,160 270,180 Q250,210 220,200 Q200,190 220,170" />
    </g>
    
    {/* Parks */}
    <g fill="rgba(39, 174, 96, 0.2)">
      {/* Golden Gate Park */}
      <path d="M150,180 L240,180 L240,210 L150,210 Z" />
      
      {/* Dolores Park */}
      <rect x="270" y="220" width="20" height="15" />
      
      {/* Alamo Square */}
      <rect x="240" y="150" width="15" height="15" />
      
      {/* Presidio */}
      <path d="M150,50 L200,50 L200,100 L150,100 Z" />
    </g>
    
    {/* Landmarks with subtle markers */}
    <g>
      {/* Ferry Building */}
      <circle cx="400" cy="150" r="3" fill="#F1C40F" filter="url(#glow)" />
      <text x="385" y="140" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Arial">Ferry Building</text>
      
      {/* Coit Tower */}
      <circle cx="310" cy="110" r="2" fill="#E67E22" filter="url(#glow)" />
      <text x="310" y="100" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Arial">Coit Tower</text>
      
      {/* Salesforce Tower */}
      <circle cx="360" cy="160" r="2.5" fill="#3498DB" filter="url(#glow)" />
      <text x="360" y="150" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Arial">Salesforce</text>
      
      {/* AT&T Park */}
      <circle cx="380" cy="220" r="2" fill="#E74C3C" filter="url(#glow)" />
      <text x="380" y="210" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Arial">Oracle Park</text>
      
      {/* Twin Peaks */}
      <circle cx="230" cy="220" r="2.5" fill="#9B59B6" filter="url(#glow)" />
      <text x="230" y="210" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Arial">Twin Peaks</text>
    </g>
    
    {/* Compass */}
    <g>
      <circle cx="40" cy="40" r="15" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <text x="40" y="43" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Arial">N</text>
      <line x1="40" y1="25" x2="40" y2="35" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
    </g>
    
    {/* Water texture */}
    <g opacity="0.1">
      <path d="M0,80 Q30,75 60,85 Q90,95 120,85 Q150,75 180,85" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
      <path d="M0,100 Q30,95 60,105 Q90,115 120,105 Q150,95 180,105" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
      <path d="M0,120 Q30,115 60,125 Q90,135 120,125 Q150,115 180,125" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
      
      <path d="M420,80 Q450,75 480,85 Q510,95 540,85 Q570,75 600,85" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
      <path d="M420,100 Q450,95 480,105 Q510,115 540,105 Q570,95 600,105" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
      <path d="M420,120 Q450,115 480,125 Q510,135 540,125 Q570,115 600,125" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
    </g>
  </svg>
);

const Heatmap: React.FC<HeatmapProps> = ({ data, width, height }) => {
  const [css] = useStyletron();
  
  const maxValue = Math.max(...data.map(cell => cell.value));
  
  // Enhanced color function with gradient from blue (low) to red (high)
  const getColor = (value: number) => {
    const intensity = value / maxValue;
    
    if (intensity < 0.3) {
      // Blue to teal gradient for low values
      return `rgba(0, ${Math.floor(150 + intensity * 105)}, ${Math.floor(255 - intensity * 100)}, ${0.5 + intensity * 0.5})`;
    } else if (intensity < 0.7) {
      // Teal to yellow gradient for medium values
      const normalizedIntensity = (intensity - 0.3) / 0.4;
      return `rgba(${Math.floor(normalizedIntensity * 255)}, ${Math.floor(200 - normalizedIntensity * 50)}, ${Math.floor(200 - normalizedIntensity * 200)}, ${0.65 + normalizedIntensity * 0.15})`;
    } else {
      // Yellow to red gradient for high values
      const normalizedIntensity = (intensity - 0.7) / 0.3;
      return `rgba(255, ${Math.floor(200 - normalizedIntensity * 200)}, 0, ${0.8 + normalizedIntensity * 0.2})`;
    }
  };
  
  // Calculate size based on value
  const getSize = (value: number) => {
    const intensity = value / maxValue;
    return 20 + intensity * 30; // Size between 20px and 50px
  };
  
  // Add pulse animation for high-value points
  const getPulseAnimation = (value: number) => {
    const intensity = value / maxValue;
    if (intensity > 0.7) {
      return {
        animation: 'pulse 1.5s infinite',
        '@keyframes pulse': {
          '0%': {
            transform: 'translate(-50%, -50%) scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.7)'
          },
          '70%': {
            transform: 'translate(-50%, -50%) scale(1.1)',
            boxShadow: '0 0 0 10px rgba(255, 0, 0, 0)'
          },
          '100%': {
            transform: 'translate(-50%, -50%) scale(1)',
            boxShadow: '0 0 0 0 rgba(255, 0, 0, 0)'
          }
        }
      };
    }
    return {
      transform: 'translate(-50%, -50%)'
    };
  };
  
  return (
    <div 
      className={css({
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#1A2632',
        backgroundSize: 'cover',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      })}
    >
      <SanFranciscoMap />
      
      {data.map((cell, index) => (
        <div
          key={index}
          className={css({
            position: 'absolute',
            left: `${cell.x}px`,
            top: `${cell.y}px`,
            width: `${getSize(cell.value)}px`,
            height: `${getSize(cell.value)}px`,
            borderRadius: '50%',
            backgroundColor: getColor(cell.value),
            opacity: 0.8,
            boxShadow: `0 0 ${10 + (cell.value / maxValue) * 20}px ${getColor(cell.value)}`,
            zIndex: Math.floor((cell.value / maxValue) * 10) + 1,
            ...getPulseAnimation(cell.value)
          })}
        />
      ))}
      
      {/* Add some static landmarks */}
      <div className={css({
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.8)',
        boxShadow: '0 0 5px rgba(255,255,255,0.8)',
        zIndex: 2
      })} />
      
      <div className={css({
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.3)',
        zIndex: 1
      })} />
    </div>
  );
};

const DriverHeatmap: React.FC = () => {
  const [css] = useStyletron();
  const [timeframe, setTimeframe] = useState<Value>([{ id: '1', label: 'Next Hour' }]);
  const [mockData, setMockData] = useState<HeatmapCell[]>([]);
  
  // Generate more realistic mock data
  useEffect(() => {
    const generateMockData = () => {
      // Create a realistic pattern for San Francisco
      const mockData: HeatmapCell[] = [];
      
      // Base number of points
      const numPoints = 200;
      
      // Define hotspot areas based on San Francisco landmarks and districts
      const hotspots = [
        { x: 350, y: 150, intensity: 0.9, radius: 40 }, // Financial District
        { x: 300, y: 220, intensity: 0.8, radius: 30 }, // Mission District
        { x: 350, y: 200, intensity: 0.85, radius: 35 }, // SoMa
        { x: 230, y: 100, intensity: 0.75, radius: 25 }, // North Beach/Fisherman's Wharf
        { x: 200, y: 90, intensity: 0.7, radius: 30 },  // Marina
        { x: 360, y: 160, intensity: 0.8, radius: 25 }, // Salesforce Tower area
        { x: 380, y: 220, intensity: 0.75, radius: 30 }, // Oracle Park area
        { x: 240, y: 150, intensity: 0.65, radius: 20 }, // Alamo Square
      ];
      
      // Add time-based variation based on selected timeframe
      const selectedTimeframe = String(timeframe[0]?.label || '').toLowerCase();
      const timeMultiplier = selectedTimeframe.includes('hour') ? 1 : 
                            selectedTimeframe.includes('3') ? 0.8 : 0.6;
      
      // Generate points around hotspots
      hotspots.forEach(hotspot => {
        // Adjust intensity based on time of day
        const adjustedIntensity = hotspot.intensity * timeMultiplier;
        
        // Create dense cluster at the center of each hotspot
        const centerPoint = {
          x: hotspot.x + (Math.random() * 10 - 5),
          y: hotspot.y + (Math.random() * 10 - 5),
          value: adjustedIntensity * (0.9 + Math.random() * 0.2)
        };
        mockData.push(centerPoint);
        
        // Create surrounding points with decreasing intensity
        const pointsInCluster = Math.floor(hotspot.radius / 2);
        for (let i = 0; i < pointsInCluster; i++) {
          const distance = Math.random() * hotspot.radius;
          const angle = Math.random() * Math.PI * 2;
          const x = hotspot.x + Math.cos(angle) * distance;
          const y = hotspot.y + Math.sin(angle) * distance;
          
          // Intensity decreases with distance from center
          const distanceFactor = 1 - (distance / hotspot.radius);
          const value = adjustedIntensity * distanceFactor * (0.7 + Math.random() * 0.3);
          
          mockData.push({ x, y, value });
        }
      });
      
      // Add some random points for areas with lower demand
      const lowDemandPoints = Math.floor(numPoints * 0.3);
      for (let i = 0; i < lowDemandPoints; i++) {
        mockData.push({
          x: 150 + Math.random() * 250,
          y: Math.random() * 400,
          value: Math.random() * 0.3
        });
      }
      
      // Add some points along major roads
      const roadPoints = Math.floor(numPoints * 0.2);
      const majorRoads = [
        // Market Street
        { x1: 200, y1: 100, x2: 400, y2: 200 },
        // Van Ness
        { x1: 270, y1: 0, x2: 270, y2: 400 },
        // Geary
        { x1: 150, y1: 120, x2: 400, y2: 120 },
        // Mission Street
        { x1: 220, y1: 150, x2: 350, y2: 250 },
        // 3rd Street
        { x1: 350, y1: 150, x2: 350, y2: 400 },
        // Embarcadero
        { x1: 400, y1: 100, x2: 400, y2: 300 }
      ];
      
      for (let i = 0; i < roadPoints; i++) {
        const road = majorRoads[Math.floor(Math.random() * majorRoads.length)];
        const t = Math.random();
        const x = road.x1 + (road.x2 - road.x1) * t;
        const y = road.y1 + (road.y2 - road.y1) * t;
        
        mockData.push({
          x,
          y,
          value: 0.3 + Math.random() * 0.3
        });
      }
      
      // Add some points along bridges
      const bridgePoints = Math.floor(numPoints * 0.1);
      const bridges = [
        { x1: 150, y1: 80, x2: 50, y2: 60 }, // Golden Gate
        { x1: 400, y1: 150, x2: 600, y2: 130 } // Bay Bridge
      ];
      
      for (let i = 0; i < bridgePoints; i++) {
        const bridge = bridges[Math.floor(Math.random() * bridges.length)];
        const t = Math.random();
        const x = bridge.x1 + (bridge.x2 - bridge.x1) * t;
        const y = bridge.y1 + (bridge.y2 - bridge.y1) * t;
        
        mockData.push({
          x,
          y,
          value: 0.4 + Math.random() * 0.3
        });
      }
      
      // Avoid points in the water areas
      return mockData.filter(point => {
        // Check if point is in Pacific Ocean
        if (point.x < 150) {
          return false;
        }
        
        // Check if point is in SF Bay
        if (point.x > 400) {
          // Bay area
          return false;
        }
        
        // Check if point is within the peninsula shape
        return true;
      });
    };
    
    setMockData(generateMockData());
  }, [timeframe]);
  
  const { data, loading, error } = useQuery(GET_DRIVER_HEATMAP_DATA, {
    variables: { timeframe: timeframe[0]?.id || '1' },
  });
  
  const timeframeOptions = [
    { id: '1', label: 'Next Hour' },
    { id: '3', label: 'Next 3 Hours' },
    { id: '6', label: 'Next 6 Hours' },
  ];
  
  const width = 600;
  const height = 400;
  
  return (
    <Card overrides={{
      Root: {
        style: {
          width: '100%',
          backgroundColor: '#1E1E1E',
          color: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      },
      Contents: {
        style: {
          padding: '24px'
        }
      }
    }}>
      <HeadingMedium $style={{ 
        color: '#FFFFFF', 
        marginTop: 0, 
        marginBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '12px'
      }}>
        Demand Forecast Heatmap
      </HeadingMedium>
      
      <div className={css({ marginBottom: '16px' })}>
        <Select
          options={timeframeOptions}
          value={timeframe}
          onChange={params => setTimeframe(params.value)}
          placeholder="Select timeframe"
          overrides={{
            ControlContainer: {
              style: {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }
            },
            ValueContainer: {
              style: {
                color: '#FFFFFF'
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
          height: `${height}px`
        })}>
          <Spinner size="large" />
          <span className={css({ marginLeft: '12px', color: '#FFFFFF' })}>Loading heatmap data...</span>
        </div>
      ) : error ? (
        <div className={css({
          padding: '40px',
          textAlign: 'center',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          borderRadius: '8px',
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        })}>
          <ParagraphSmall $style={{ color: '#FF5555' }}>
            Error loading heatmap data: {error.message}
          </ParagraphSmall>
        </div>
      ) : (
        <Heatmap 
          data={data?.driverHeatmapData || mockData}
          width={width}
          height={height}
        />
      )}
      
      <div className={css({ 
        marginTop: '24px', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        padding: '12px',
        borderRadius: '8px'
      })}>
        <div className={css({ 
          display: 'flex', 
          alignItems: 'center', 
          marginRight: '24px',
          background: 'linear-gradient(to right, rgba(0, 180, 255, 0.7), rgba(255, 200, 0, 0.7), rgba(255, 0, 0, 0.7))',
          height: '8px',
          width: '120px',
          borderRadius: '4px'
        })} />
        
        <div className={css({ display: 'flex', alignItems: 'center', marginRight: '16px' })}>
          <div className={css({ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'rgba(0, 180, 255, 0.7)', 
            marginRight: '8px',
            borderRadius: '2px',
          })} />
          <ParagraphSmall $style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Low</ParagraphSmall>
        </div>
        
        <div className={css({ display: 'flex', alignItems: 'center', marginRight: '16px' })}>
          <div className={css({ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'rgba(255, 200, 0, 0.7)', 
            marginRight: '8px',
            borderRadius: '2px',
          })} />
          <ParagraphSmall $style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Medium</ParagraphSmall>
        </div>
        
        <div className={css({ display: 'flex', alignItems: 'center' })}>
          <div className={css({ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'rgba(255, 0, 0, 0.7)', 
            marginRight: '8px',
            borderRadius: '2px',
          })} />
          <ParagraphSmall $style={{ color: 'rgba(255, 255, 255, 0.7)' }}>High</ParagraphSmall>
        </div>
      </div>
    </Card>
  );
};

export default DriverHeatmap; 