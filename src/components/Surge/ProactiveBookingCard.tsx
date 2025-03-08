import React from 'react';
import { Card } from 'baseui/card';
import { Button } from 'baseui/button';
import { useStyletron } from 'baseui';
import { format } from 'date-fns';
import { ArrowRight } from 'baseui/icon';

interface ProactiveBookingCardProps {
  nextCommuteHour: number;
  nextCommuteSurge: number;
}

const ProactiveBookingCard: React.FC<ProactiveBookingCardProps> = ({
  nextCommuteHour,
  nextCommuteSurge
}) => {
  const [css] = useStyletron();

  // Format the time for display (e.g., "8:00 AM")
  const formattedTime = format(new Date().setHours(nextCommuteHour, 0, 0, 0), 'h:mm a');

  // Determine if the surge is high enough to warrant a proactive booking
  const isHighSurge = nextCommuteSurge >= 1.5;

  // Calculate the estimated savings (between 10-25% based on surge level)
  const savingsPercent = Math.min(Math.floor((nextCommuteSurge - 1) * 20), 25);

  return (
    <Card
      overrides={{
        Root: {
          style: {
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            backgroundColor: isHighSurge ? '#FFF8E1' : '#FFFFFF',
            borderLeft: isHighSurge ? '4px solid #FFC107' : 'none',
          }
        }
      }}
    >
      <div className={css({ padding: '16px' })}>
        <div className={css({
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#000000',
        })}>
          Next Commute: {formattedTime}
        </div>

        <div className={css({
          fontSize: '14px',
          color: '#666666',
          marginBottom: '16px',
        })}>
          {isHighSurge ? (
            <>
              <span className={css({
                color: '#D32F2F',
                fontWeight: 'bold'
              })}>
                High demand expected
              </span>
              {' '}with a surge multiplier of{' '}
              <span className={css({
                color: '#D32F2F',
                fontWeight: 'bold'
              })}>
                {nextCommuteSurge.toFixed(1)}x
              </span>
            </>
          ) : (
            <>
              <span className={css({
                color: '#2E7D32',
                fontWeight: 'bold'
              })}>
                Normal demand expected
              </span>
              {' '}with a surge multiplier of{' '}
              <span className={css({
                fontWeight: 'bold'
              })}>
                {nextCommuteSurge.toFixed(1)}x
              </span>
            </>
          )}
        </div>

        {isHighSurge && (
          <div className={css({
            fontSize: '14px',
            color: '#666666',
            marginBottom: '16px',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            padding: '8px',
            borderRadius: '4px',
          })}>
            <strong>Pro Tip:</strong> Book now to lock in a lower price and save up to {savingsPercent}% on your ride at {formattedTime}.
          </div>
        )}

        <Button
          overrides={{
            BaseButton: {
              style: {
                width: '100%',
                backgroundColor: isHighSurge ? '#276EF1' : '#EEEEEE',
                color: isHighSurge ? '#FFFFFF' : '#666666',
              }
            }
          }}
          endEnhancer={<ArrowRight size={24} />}
        >
          {isHighSurge ? 'Book Now & Save' : 'Book Ride'}
        </Button>
      </div>
    </Card>
  );
};

export default ProactiveBookingCard; 