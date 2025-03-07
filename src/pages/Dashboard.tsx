import React from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';
import PriceLockCard from '../components/PriceLock/PriceLockCard';
import { Card } from 'baseui/card';
import { useStyletron } from 'baseui';

const Dashboard: React.FC = () => {
  const [css] = useStyletron();
  const routeId = 'some-route-id'; // Replace with actual route ID
  const initialData = [
    { timestamp: '2023-10-01T00:00:00Z', multiplier: 1.2 },
    { timestamp: '2023-10-01T01:00:00Z', multiplier: 1.5 },
    { timestamp: '2023-10-01T02:00:00Z', multiplier: 1.8 },
    { timestamp: '2023-10-01T03:00:00Z', multiplier: 1.3 },
    { timestamp: '2023-10-01T04:00:00Z', multiplier: 1.1 },
    { timestamp: '2023-10-01T05:00:00Z', multiplier: 1.0 },
  ];

  return (
    <div>
      <HeadingLarge>Surge Prediction Dashboard</HeadingLarge>
      
      <Grid>
        <Cell span={8}>
          <SurgeTimeline routeId={routeId} initialData={initialData} />
        </Cell>
        
        <Cell span={4}>
          <div className={css({ marginBottom: '24px' })}>
            <PriceLockCard />
          </div>
          
          <Card>
            <div className={css({ padding: '16px' })}>
              <HeadingLarge $style={{ fontSize: '18px', marginTop: 0 }}>Recent Notifications</HeadingLarge>
              
              <div className={css({ 
                backgroundColor: '#FFF4DE', 
                padding: '12px', 
                borderRadius: '4px',
                marginBottom: '12px'
              })}>
                <div className={css({ fontWeight: 'bold' })}>Pre-Surge Warning</div>
                <div>Expecting 1.8x surge around 5 PM today. Book now to avoid higher prices.</div>
              </div>
              
              <div className={css({ 
                backgroundColor: '#EDF3FE', 
                padding: '12px', 
                borderRadius: '4px' 
              })}>
                <div className={css({ fontWeight: 'bold' })}>Price Lock Available</div>
                <div>Lock in standard rates for your evening commute before prices increase.</div>
              </div>
            </div>
          </Card>
        </Cell>
      </Grid>
    </div>
  );
};

export default Dashboard; 