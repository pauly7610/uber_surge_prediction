import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Card } from 'baseui/card';
import { Button } from 'baseui/button';
import { ParagraphSmall, HeadingMedium } from 'baseui/typography';
import { LOCK_SURGE_PRICE } from '../../graphql/mutations';
import { useSurgeData } from '../../hooks/useSurgeData';
import { Notification } from 'baseui/notification';
import { useStyletron } from 'baseui';
import { Check, Alert } from 'baseui/icon';
import { ProgressBar } from 'baseui/progress-bar';

const PriceLockCard: React.FC = () => {
  const [css] = useStyletron();
  const [lockPrice, { loading, error }] = useMutation(LOCK_SURGE_PRICE);
  const { surgeData, loading: surgeLoading } = useSurgeData();
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const handleLock = async () => {
    if (surgeData) {
      try {
        await lockPrice({ variables: { multiplier: surgeData.multiplier } });
        setLocked(true);
        
        // Start countdown
        const interval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setLocked(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      } catch (err) {
        console.error('Error locking price:', err);
      }
    }
  };

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Card>
      <HeadingMedium>Lock Current Price</HeadingMedium>
      
      {error && (
        <Notification kind="negative" closeable>
          Error locking price: {error.message}
        </Notification>
      )}
      
      {locked && (
        <div className={css({ marginBottom: '16px' })}>
          <Notification kind="positive">
            <div className={css({ display: 'flex', alignItems: 'center' })}>
              <Check size={24} />
              <div className={css({ marginLeft: '8px' })}>
                Price locked at {surgeData?.multiplier}x for {formatTimeLeft()}
              </div>
            </div>
          </Notification>
          <ProgressBar 
            value={timeLeft} 
            successValue={300}
            overrides={{
              BarProgress: {
                style: {
                  backgroundColor: '#05944F',
                },
              },
            }}
          />
        </div>
      )}
      
      <div className={css({ display: 'flex', alignItems: 'center', marginBottom: '16px' })}>
        <ParagraphSmall>
          Current Multiplier: {surgeLoading ? 'Loading...' : `${surgeData?.multiplier}x`}
        </ParagraphSmall>
        
        {surgeData && surgeData.multiplier > 1.5 && (
          <div className={css({ display: 'flex', alignItems: 'center', marginLeft: '8px' })}>
            <Alert size={16} color="#FFC043" />
            <ParagraphSmall color="#FFC043">High demand</ParagraphSmall>
          </div>
        )}
      </div>
      
      <Button
        onClick={handleLock}
        overrides={{
          BaseButton: {
            style: {
              width: '100%',
            }
          }
        }}
        disabled={!surgeData || loading || locked}
        isLoading={loading}
      >
        {locked ? `Locked (${formatTimeLeft()})` : 'Lock Price for 5 Minutes'}
      </Button>
    </Card>
  );
};

export default PriceLockCard;