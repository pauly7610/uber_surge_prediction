import React from 'react';
import { Grid, Cell } from 'baseui/layout-grid';
import { HeadingLarge } from 'baseui/typography';
import SurgeTimeline from '../components/SurgeTimeline/SurgeTimeline';
import { Card } from 'baseui/card';
import { useStyletron } from 'baseui';

const Dashboard: React.FC = () => {
  const [css] = useStyletron();
  const routeId = 'some-route-id';
  
  // Helper function for notification card styling
  const getNotificationCardStyle = (color: string) => {
    return css({
      backgroundColor: `rgba(${color === '#FFC107' ? '255, 193, 7' : '66, 133, 244'}, 0.15)`,
      padding: '16px', 
      borderRadius: '8px',
      marginBottom: color === '#FFC107' ? '16px' : '0px',
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: color,
      borderRightWidth: '0px',
      borderTopWidth: '0px',
      borderBottomWidth: '0px',
      borderRightStyle: 'solid',
      borderTopStyle: 'solid',
      borderBottomStyle: 'solid',
      borderRightColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent'
    });
  };
  
  // Comprehensive initial data for faster loading
  const initialData = [
    // Current data
    { id: "current-1", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), multiplier: 1.3, area: "Downtown" },
    { id: "current-2", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), multiplier: 1.5, area: "Downtown" },
    { id: "current-3", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), multiplier: 1.8, area: "Downtown" },
    { id: "current-4", timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), multiplier: 2.0, area: "Downtown" },
    { id: "current-5", timestamp: new Date().toISOString(), multiplier: 1.7, area: "Downtown" },
    
    // Historical data
    { id: "hist-1", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), multiplier: 1.2, area: "Downtown" },
    { id: "hist-2", timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(), multiplier: 1.4, area: "Downtown" },
    { id: "hist-3", timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(), multiplier: 1.6, area: "Downtown" },
    { id: "hist-4", timestamp: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(), multiplier: 1.9, area: "Downtown" },
    { id: "hist-5", timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), multiplier: 2.1, area: "Downtown" },
    { id: "hist-6", timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(), multiplier: 1.8, area: "Downtown" },
    { id: "hist-7", timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), multiplier: 1.5, area: "Downtown" },
    { id: "hist-8", timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(), multiplier: 1.3, area: "Downtown" },
    { id: "hist-9", timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(), multiplier: 1.2, area: "Downtown" },
    { id: "hist-10", timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(), multiplier: 1.1, area: "Downtown" },
    { id: "hist-11", timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), multiplier: 1.0, area: "Downtown" },
    { id: "hist-12", timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(), multiplier: 1.2, area: "Downtown" },
    
    // Predicted data
    { id: "pred-1", timestamp: new Date(Date.now() + 15 * 60 * 1000).toISOString(), multiplier: 1.9, area: "Downtown" },
    { id: "pred-2", timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(), multiplier: 2.1, area: "Downtown" },
    { id: "pred-3", timestamp: new Date(Date.now() + 45 * 60 * 1000).toISOString(), multiplier: 2.3, area: "Downtown" },
    { id: "pred-4", timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString(), multiplier: 2.0, area: "Downtown" },
    { id: "pred-5", timestamp: new Date(Date.now() + 75 * 60 * 1000).toISOString(), multiplier: 1.8, area: "Downtown" },
    { id: "pred-6", timestamp: new Date(Date.now() + 90 * 60 * 1000).toISOString(), multiplier: 1.5, area: "Downtown" },
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
              
              <div className={getNotificationCardStyle('#FFC107')}>
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
              
              <div className={getNotificationCardStyle('#4285F4')}>
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