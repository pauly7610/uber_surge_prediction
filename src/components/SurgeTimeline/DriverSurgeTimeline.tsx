import React from 'react';
import { AreaChart, XAxis, YAxis, Tooltip, Area, ResponsiveContainer } from 'recharts';
import CardWrapper from '../common/CardWrapper';
import { useStyletron } from 'baseui';

// Define the SurgePrediction type
interface SurgePrediction {
  timestamp: string;
  multiplier: number;
}

interface DriverSurgeTimelineProps {
  routeId: string;
  initialData: SurgePrediction[];
}

const DriverSurgeTimeline: React.FC<DriverSurgeTimelineProps> = ({ initialData }) => {
  const [css] = useStyletron();
  
  // Format dates for display - simplify as much as possible
  const formattedChartData = initialData.map(item => {
    const date = new Date(item.timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return {
      hour: hours,
      multiplier: item.multiplier,
      label: `${hours}:${minutes < 10 ? '0' + minutes : minutes}`
    };
  });

  return (
    <CardWrapper 
      title="Surge Forecast"
      subtitle="View predicted surge pricing over time"
    >
      <div style={{ 
        backgroundColor: 'rgba(39, 110, 241, 0.1)',
        color: '#276EF1',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px'
      }}>
        <div style={{
          marginRight: '12px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: '#276EF1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}>
          i
        </div>
        Price Lock Available: Lock in standard rates for your evening commute before prices increase.
      </div>
      
      <div style={{
        position: 'relative',
        minHeight: '300px',
        marginTop: '20px',
        backgroundColor: 'rgba(39, 110, 241, 0.05)',
        borderRadius: '8px',
        padding: '16px',
        border: '1px solid rgba(39, 110, 241, 0.1)',
      }}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={formattedChartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <XAxis 
              dataKey="label" 
              tick={{ fill: '#666' }}
            />
            <YAxis 
              domain={[1, 'auto']} 
              tick={{ fill: '#666' }}
            />
            <Tooltip 
              formatter={(value: any) => [`${value}x`, 'Surge Multiplier']}
            />
            <Area
              type="monotone"
              dataKey="multiplier"
              stroke="#276EF1"
              fill="#276EF1"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardWrapper>
  );
};

export default DriverSurgeTimeline; 