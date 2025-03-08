import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import CardWrapper from '../common/CardWrapper';
import Button from '../common/Button';
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
        
        // Clean up interval
        return () => clearInterval(interval);
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
    <CardWrapper 
      title="Price Lock" 
      subtitle="Lock in the current surge price for 5 minutes"
    >
      <div className={css({
        backgroundColor: 'rgba(39, 110, 241, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      })}>
        {locked ? (
          <div>
            <div className={css({
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              backgroundColor: 'rgba(6, 193, 103, 0.1)',
              padding: '12px',
              borderRadius: '8px'
            })}>
              <Check size={24} color="var(--success)" />
              <ParagraphSmall $style={{ 
                marginLeft: '12px',
                color: 'var(--success)',
                fontWeight: 'bold'
              }}>
                Price locked successfully!
              </ParagraphSmall>
            </div>
            
            <div className={css({ marginBottom: '16px' })}>
              <ParagraphSmall>
                Time remaining:
              </ParagraphSmall>
              <HeadingMedium $style={{ 
                margin: '8px 0',
                color: timeLeft < 60 ? 'var(--warning)' : 'var(--dark-gray)'
              }}>
                {formatTimeLeft()}
              </HeadingMedium>
              <ProgressBar 
                value={timeLeft} 
                successValue={300}
                overrides={{
                  BarProgress: {
                    style: {
                      backgroundColor: timeLeft < 60 ? 'var(--warning)' : 'var(--success)'
                    }
                  }
                }}
              />
            </div>
            
            <div className={css({
              backgroundColor: 'var(--uber-white)',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center'
            })}>
              <HeadingMedium $style={{ margin: '0 0 8px 0' }}>
                {surgeData?.multiplier.toFixed(1)}x
              </HeadingMedium>
              <ParagraphSmall>
                Locked Surge Multiplier
              </ParagraphSmall>
            </div>
          </div>
        ) : (
          <div>
            <div className={css({
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              marginBottom: '24px'
            })}>
              <HeadingMedium $style={{ 
                margin: '0 0 8px 0',
                color: surgeData?.multiplier && surgeData.multiplier > 1.5 ? 'var(--high-demand)' : 'var(--dark-gray)'
              }}>
                {surgeLoading ? '...' : surgeData ? `${surgeData.multiplier.toFixed(1)}x` : 'N/A'}
              </HeadingMedium>
              <ParagraphSmall>
                Current Surge Multiplier
              </ParagraphSmall>
            </div>
            
            <ParagraphSmall $style={{ 
              marginBottom: '16px',
              color: 'var(--uber-blue)',
              textAlign: 'center'
            }}>
              Lock in standard rates for your evening commute before prices increase.
            </ParagraphSmall>
            
            <Button 
              variant="primary" 
              fullWidth
              onClick={handleLock}
              disabled={loading || !surgeData}
            >
              {loading ? 'Locking...' : 'Lock Price for 5 Minutes'}
            </Button>
          </div>
        )}
      </div>
      
      {error && (
        <Notification kind="negative" closeable>
          Error locking price: {error.message}
        </Notification>
      )}
    </CardWrapper>
  );
};

export default PriceLockCard;