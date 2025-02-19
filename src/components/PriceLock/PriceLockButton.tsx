import React from 'react';
import { Button } from 'baseui/button';
import { useMutation } from '@apollo/client';
import { LOCK_SURGE_PRICE } from '../../graphql/mutations';

const PriceLockButton: React.FC = () => {
  const [lockPrice] = useMutation(LOCK_SURGE_PRICE);

  const handleLock = () => {
    lockPrice();
    alert('Price locked for 5 minutes!');
  };

  return (
    <Button onClick={handleLock} overrides={{ BaseButton: { style: { width: '100%' } } }}>
      Lock Price for 5 Minutes
    </Button>
  );
};

export default PriceLockButton; 