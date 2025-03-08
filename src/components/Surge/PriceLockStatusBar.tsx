import React from 'react';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';

interface PriceLockStatusBarProps {
  lockedPrice: number;
  projectedPeak: number;
  savingsPercent: number;
}

const PriceLockStatusBar: React.FC<PriceLockStatusBarProps> = ({ 
  lockedPrice, 
  projectedPeak, 
  savingsPercent 
}) => {
  const [css] = useStyletron();
  
  return (
    <div className={css({
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      borderTop: '1px solid #E5E7EB',
      padding: '12px 24px',
      boxShadow: '0 -4px 12px -2px rgba(0, 0, 0, 0.15)',
      zIndex: 1000
    })}>
      <div className={css({
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      })}>
        <div className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        })}>
          <div className={css({
            fontWeight: '600',
            fontSize: '16px'
          })}>
            Locked Price: ${lockedPrice.toFixed(2)}
          </div>
          <div className={css({
            fontSize: '14px',
            color: '#6B7280'
          })}>
            vs. Projected Peak: ${projectedPeak.toFixed(2)}
          </div>
        </div>
        
        <div className={css({
          color: '#10B981',
          fontWeight: '600',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '0 16px'
        })}>
          Save {savingsPercent}%
        </div>
        
        <Button
          overrides={{
            BaseButton: {
              style: {
                backgroundColor: '#276EF1',
                color: 'white',
                fontWeight: '600',
                fontSize: '15px',
                padding: '10px 20px',
                borderRadius: '8px',
                ':hover': {
                  backgroundColor: '#1E54B7'
                }
              }
            }
          }}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default PriceLockStatusBar; 