import React from 'react';
import { Card } from 'baseui/card';
import { HeadingMedium, ParagraphSmall, LabelMedium } from 'baseui/typography';
import { useStyletron } from 'baseui';
import { useQuery } from '@apollo/client';
import { GET_DRIVER_POSITIONING_INCENTIVES } from '../../graphql/queries';
import { Button } from 'baseui/button';
import { Tag } from 'baseui/tag';
import { ArrowUp } from 'baseui/icon';

interface PositioningIncentive {
  id: string;
  area: string;
  incentiveAmount: number;
  deadline: string;
  estimatedDemand: 'HIGH' | 'MEDIUM' | 'LOW';
  distance: number;
  estimatedTimeToArrive: number;
}

const DriverPositioning: React.FC = () => {
  const [css] = useStyletron();
  const { data, loading, error } = useQuery(GET_DRIVER_POSITIONING_INCENTIVES);
  
  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'HIGH': return '#FF0000';
      case 'MEDIUM': return '#FFA500';
      case 'LOW': return '#008000';
      default: return '#000000';
    }
  };
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  return (
    <Card>
      <HeadingMedium>Positioning Incentives</HeadingMedium>
      
      {loading ? (
        <ParagraphSmall>Loading incentives...</ParagraphSmall>
      ) : error ? (
        <ParagraphSmall color="negative">Error loading incentives: {error.message}</ParagraphSmall>
      ) : (
        <div>
          {data?.driverPositioningIncentives.map((incentive: PositioningIncentive) => (
            <div 
              key={incentive.id}
              className={css({
                marginBottom: '16px',
                padding: '16px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
              })}
            >
              <div className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                <div>
                  <LabelMedium>{incentive.area}</LabelMedium>
                  <div className={css({ display: 'flex', alignItems: 'center', marginTop: '4px' })}>
                    <Tag 
                      closeable={false}
                      kind="positive"
                    >
                      +${incentive.incentiveAmount.toFixed(2)}
                    </Tag>
                    <ParagraphSmall marginLeft="8px">
                      Deadline: {new Date(incentive.deadline).toLocaleTimeString()}
                    </ParagraphSmall>
                  </div>
                </div>
                
                <div className={css({ textAlign: 'right' })}>
                  <div className={css({ display: 'flex', alignItems: 'center' })}>
                    <div 
                      className={css({ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: getDemandColor(incentive.estimatedDemand),
                        borderRadius: '50%',
                        marginRight: '4px',
                      })} 
                    />
                    <ParagraphSmall>{incentive.estimatedDemand} Demand</ParagraphSmall>
                  </div>
                  <ParagraphSmall>
                    {incentive.distance.toFixed(1)} miles away • {formatTime(incentive.estimatedTimeToArrive)}
                  </ParagraphSmall>
                </div>
              </div>
              
              <Button 
                kind="secondary"
                size="compact"
                overrides={{
                  BaseButton: {
                    style: {
                      width: '100%',
                      marginTop: '12px',
                    },
                  },
                }}
                startEnhancer={<ArrowUp size={16} />}
              >
                Navigate to Area
              </Button>
            </div>
          ))}
          
          {data?.driverPositioningIncentives.length === 0 && (
            <ParagraphSmall>No positioning incentives available at this time.</ParagraphSmall>
          )}
        </div>
      )}
    </Card>
  );
};

export default DriverPositioning; 