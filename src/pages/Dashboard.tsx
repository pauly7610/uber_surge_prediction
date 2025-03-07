import React from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';
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
    <div className={css({ 
      padding: '24px',
      backgroundColor: '#121212',
      minHeight: 'calc(100vh - 60px)'
    })}>
      <HeadingLarge marginTop="0" marginBottom="32px" color="#FFFFFF">
        Surge Prediction Dashboard
      </HeadingLarge>
      
      <Grid gridGaps={[24, 24, 24]} gridGutters={[24, 24, 24]}>
        <Cell span={[4, 8, 8]}>
          <div className={css({ marginBottom: '24px' })}>
            <SurgeTimeline routeId={routeId} initialData={initialData} />
          </div>
        </Cell>
        
        <Cell span={[4, 8, 4]}>
          <div className={css({ marginBottom: '24px' })}>
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
              <div>
                <HeadingLarge $style={{ 
                  fontSize: '18px', 
                  marginTop: 0, 
                  marginBottom: '24px',
                  color: '#FFFFFF',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingBottom: '12px'
                }}>
                  Lock Current Price
                </HeadingLarge>
                <button className={css({
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#4285F4',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#3367D6',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                  }
                })}>
                  Lock Price for 5 Minutes
                </button>
              </div>
            </Card>
          </div>
          
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
            <div>
              <HeadingLarge $style={{ 
                fontSize: '18px', 
                marginTop: 0, 
                marginBottom: '24px',
                color: '#FFFFFF',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '12px'
              }}>
                Recent Notifications
              </HeadingLarge>
              
              <div className={css({ 
                backgroundColor: 'rgba(255, 193, 7, 0.15)', 
                padding: '16px', 
                borderRadius: '8px',
                marginBottom: '16px',
                borderLeft: '4px solid #FFC107'
              })}>
                <div className={css({ 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#FFC107'
                })}>
                  Pre-Surge Warning
                </div>
                <div className={css({ color: 'rgba(255, 255, 255, 0.8)' })}>
                  Expecting 1.8x surge around 5 PM today. Book now to avoid higher prices.
                </div>
              </div>
              
              <div className={css({ 
                backgroundColor: 'rgba(66, 133, 244, 0.15)', 
                padding: '16px', 
                borderRadius: '8px',
                borderLeft: '4px solid #4285F4'
              })}>
                <div className={css({ 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: '#4285F4'
                })}>
                  Price Lock Available
                </div>
                <div className={css({ color: 'rgba(255, 255, 255, 0.8)' })}>
                  Lock in standard rates for your evening commute before prices increase.
                </div>
              </div>
            </div>
          </Card>
        </Cell>
      </Grid>
    </div>
  );
};

export default Dashboard; 