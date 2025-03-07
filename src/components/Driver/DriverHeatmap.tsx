import React, { useState } from 'react';
import { Card } from 'baseui/card';
import { HeadingMedium, ParagraphSmall } from 'baseui/typography';
import { useStyletron } from 'baseui';
import { Select, Value } from 'baseui/select';
import { useQuery } from '@apollo/client';
import { GET_DRIVER_HEATMAP_DATA } from '../../graphql/queries';
import { Spinner } from 'baseui/spinner';

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

const Heatmap: React.FC<HeatmapProps> = ({ data, width, height }) => {
  const [css] = useStyletron();
  
  const maxValue = Math.max(...data.map(cell => cell.value));
  
  const getColor = (value: number) => {
    const intensity = value / maxValue;
    return `rgba(255, 0, 0, ${intensity})`;
  };
  
  return (
    <div 
      className={css({
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#f0f0f0',
        backgroundImage: 'linear-gradient(to bottom, #e6e6e6, #ffffff)',
        backgroundSize: 'cover',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
      })}
    >
      {data.map((cell, index) => (
        <div
          key={index}
          className={css({
            position: 'absolute',
            left: `${cell.x}px`,
            top: `${cell.y}px`,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: getColor(cell.value),
            transform: 'translate(-50%, -50%)',
            opacity: 0.7,
            boxShadow: '0 0 8px rgba(255,0,0,0.5)'
          })}
        />
      ))}
    </div>
  );
};

const DriverHeatmap: React.FC = () => {
  const [css] = useStyletron();
  const [timeframe, setTimeframe] = useState<Value>([{ id: '1', label: 'Next Hour' }]);
  
  const { data, loading, error } = useQuery(GET_DRIVER_HEATMAP_DATA, {
    variables: { timeframe: timeframe[0]?.id || '1' },
  });
  
  const timeframeOptions = [
    { id: '1', label: 'Next Hour' },
    { id: '3', label: 'Next 3 Hours' },
    { id: '6', label: 'Next 6 Hours' },
  ];
  
  return (
    <Card>
      <HeadingMedium>Demand Forecast Heatmap</HeadingMedium>
      
      <div className={css({ marginBottom: '16px' })}>
        <Select
          options={timeframeOptions}
          value={timeframe}
          onChange={params => setTimeframe(params.value)}
          placeholder="Select timeframe"
        />
      </div>
      
      {loading ? (
        <div className={css({ display: 'flex', justifyContent: 'center', padding: '40px' })}>
          <Spinner />
        </div>
      ) : error ? (
        <ParagraphSmall color="negative">Error loading heatmap data: {error.message}</ParagraphSmall>
      ) : (
        <Heatmap 
          data={data?.driverHeatmapData || []}
          width={600}
          height={400}
        />
      )}
      
      <div className={css({ marginTop: '16px', display: 'flex', alignItems: 'center' })}>
        <div className={css({ display: 'flex', alignItems: 'center', marginRight: '16px' })}>
          <div className={css({ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'rgba(255, 0, 0, 0.2)', 
            marginRight: '4px',
            borderRadius: '2px',
          })} />
          <ParagraphSmall>Low Demand</ParagraphSmall>
        </div>
        
        <div className={css({ display: 'flex', alignItems: 'center' })}>
          <div className={css({ 
            width: '12px', 
            height: '12px', 
            backgroundColor: 'rgba(255, 0, 0, 0.8)', 
            marginRight: '4px',
            borderRadius: '2px',
          })} />
          <ParagraphSmall>High Demand</ParagraphSmall>
        </div>
      </div>
    </Card>
  );
};

export default DriverHeatmap; 