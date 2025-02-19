import React from 'react';
import { useMutation } from '@apollo/client';
import { Card } from 'baseui/card';
import { Button } from 'baseui/button';
import { ParagraphSmall, HeadingMedium } from 'baseui/typography';
import { LOCK_SURGE_PRICE } from '../../graphql/mutations';
import { useSurgeData } from '../../hooks/useSurgeData';

const PriceLockCard: React.FC = () => {
  const [lockPrice] = useMutation(LOCK_SURGE_PRICE);
  const { surgeData } = useSurgeData();

  const handleLock = () => {
    if (surgeData) {
      lockPrice({ variables: { multiplier: surgeData.multiplier } });
    }
  };

  return (
    <Card>
      <HeadingMedium>Lock Current Price</HeadingMedium>
      <ParagraphSmall>
        Current Multiplier: {surgeData ? `${surgeData.multiplier}x` : 'Loading...'}
      </ParagraphSmall>
      <Button
        onClick={handleLock}
        overrides={{
          BaseButton: {
            style: {
              width: '100%',
              marginTop: '16px',
            }
          }
        }}
        disabled={!surgeData}
      >
        Lock Price for 5 Minutes
      </Button>
    </Card>
  );
};

export default PriceLockCard;