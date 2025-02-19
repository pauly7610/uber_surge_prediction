import React from 'react';
import { TooltipProps } from 'recharts';

interface DataPoint {
  timestamp: string;
  multiplier: number;
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`Time: ${label}`}</p>
        <p className="intro">{`Multiplier: ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip; 