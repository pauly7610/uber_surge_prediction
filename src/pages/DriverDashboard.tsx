import React from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import DriverHeatmap from '../components/Driver/DriverHeatmap';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';

const DriverDashboard: React.FC = () => {
  const routeId = 'driver-route-id';
  const initialData = [
    { timestamp: '2023-10-01T00:00:00Z', multiplier: 1.2 },
    { timestamp: '2023-10-01T01:00:00Z', multiplier: 1.5 },
    { timestamp: '2023-10-01T02:00:00Z', multiplier: 1.8 },
    { timestamp: '2023-10-01T03:00:00Z', multiplier: 1.3 },
  ];

  return (
    <div>
      <HeadingLarge>Driver Dashboard</HeadingLarge>
      
      <Grid>
        <Cell span={12}>
          <DriverHeatmap />
        </Cell>
        
        <Cell span={12}>
          <SurgeTimeline routeId={routeId} initialData={initialData} />
        </Cell>
      </Grid>
    </div>
  );
};

export default DriverDashboard; 