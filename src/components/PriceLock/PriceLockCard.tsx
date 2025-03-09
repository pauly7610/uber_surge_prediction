import React, { useState } from 'react';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { ParagraphSmall, HeadingMedium } from 'baseui/typography';
import { ProgressBar } from 'baseui/progress-bar';
import { Tag } from 'baseui/tag';
import CardWrapper from '../common/CardWrapper';

interface PriceLockCardProps {
  currentPrice: number;
  projectedPeak: number;
  timeRemaining: number;
  onLockPrice: () => void;
}

const PriceLockCard: React.FC<PriceLockCardProps> = ({
  currentPrice,
  projectedPeak,
  timeRemaining,
  onLockPrice
}) => {
  const [css] = useStyletron();
  const [isLocked, setIsLocked] = useState(false);
  
  // Calculate savings
  const savings = projectedPeak - currentPrice;
  const savingsPercent = Math.round((savings / projectedPeak) * 100);
  
  // Format prices
  const formattedCurrentPrice = `$${currentPrice.toFixed(2)}`;
  const formattedProjectedPeak = `$${projectedPeak.toFixed(2)}`;
  const formattedSavings = `$${savings.toFixed(2)}`;
  
  // Format time remaining
  const formatTimeRemaining = (minutes: number) => {
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '1 minute';
    return `${minutes} minutes`;
  };
  
  const handleLockPrice = () => {
    setIsLocked(true);
    onLockPrice();
  };
  
  return (
    <CardWrapper title="Price Lock">
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      })}>
        {isLocked ? (
          <div className={css({
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          })}>
            <HeadingMedium $style={{
              margin: 0,
              color: '#047857',
              fontSize: '18px'
            }}>
              Price Locked!
            </HeadingMedium>
            
            <ParagraphSmall $style={{ margin: 0 }}>
              You've locked in a price of {formattedCurrentPrice} for your trip.
              This price is guaranteed for the next {formatTimeRemaining(timeRemaining)}.
            </ParagraphSmall>
            
            <div className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px'
            })}>
              <Tag kind="positive" closeable={false}>
                Save {savingsPercent}%
              </Tag>
              <ParagraphSmall $style={{ margin: 0 }}>
                vs. projected peak of {formattedProjectedPeak}
              </ParagraphSmall>
            </div>
          </div>
        ) : (
          <>
            <div className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            })}>
              <div>
                <ParagraphSmall $style={{ margin: '0 0 4px 0', color: '#666' }}>
                  Current Price
                </ParagraphSmall>
                <HeadingMedium $style={{
                  margin: 0,
                  fontSize: '24px'
                }}>
                  {formattedCurrentPrice}
                </HeadingMedium>
              </div>
              
              <div className={css({ textAlign: 'right' })}>
                <ParagraphSmall $style={{ margin: '0 0 4px 0', color: '#666' }}>
                  Projected Peak
                </ParagraphSmall>
                <HeadingMedium $style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#EF4444'
                }}>
                  {formattedProjectedPeak}
                </HeadingMedium>
              </div>
            </div>
            
            <div>
              <div className={css({
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px'
              })}>
                <ParagraphSmall $style={{ margin: 0 }}>
                  Potential Savings
                </ParagraphSmall>
                <ParagraphSmall $style={{ margin: 0, fontWeight: 'bold', color: '#10B981' }}>
                  {formattedSavings} ({savingsPercent}%)
                </ParagraphSmall>
              </div>
              <ProgressBar
                value={savingsPercent}
                successValue={100}
                overrides={{
                  BarProgress: {
                    style: {
                      backgroundColor: '#10B981'
                    }
                  }
                }}
              />
            </div>
            
            <div>
              <ParagraphSmall $style={{ margin: '0 0 16px 0' }}>
                Lock in the current price now to avoid surge pricing later.
                This price will be guaranteed for the next {formatTimeRemaining(timeRemaining)}.
              </ParagraphSmall>
              
              <Button
                onClick={handleLockPrice}
                overrides={{
                  BaseButton: {
                    style: {
                      width: '100%'
                    }
                  }
                }}
              >
                Lock Price at {formattedCurrentPrice}
              </Button>
            </div>
          </>
        )}
      </div>
    </CardWrapper>
  );
};

export default PriceLockCard;