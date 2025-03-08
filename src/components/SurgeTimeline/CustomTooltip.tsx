import React from 'react';
import { TooltipProps } from 'recharts';

interface DataPoint {
  timestamp: string;
  multiplier: number;
  formattedTime: string;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const multiplier = payload[0].value as number;
    const dataPoint = payload[0].payload as DataPoint;
    
    // Determine color based on multiplier value
    const getMultiplierColor = (value: number) => {
      if (value >= 2.0) return '#F44336'; // Red for high surge
      if (value >= 1.5) return '#FF9800'; // Orange for medium surge
      return '#4CAF50'; // Green for low surge
    };
    
    return (
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
        padding: '12px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        color: '#333',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <p style={{ 
          margin: '0 0 8px 0',
          fontWeight: 'bold',
          borderBottom: '1px solid #eee',
          paddingBottom: '8px'
        }}>
          {dataPoint.formattedTime || label}
        </p>
        <p style={{ 
          margin: '0',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ marginRight: '8px' }}>Surge Multiplier:</span>
          <span style={{ 
            fontWeight: 'bold',
            color: getMultiplierColor(multiplier)
          }}>
            {multiplier}x
          </span>
        </p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip; 