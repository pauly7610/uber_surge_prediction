import React from 'react';
import { Card as BaseCard, CardProps } from 'baseui/card';

// Create a wrapper component for Card that uses default parameters instead of defaultProps
const CardWrapper: React.FC<CardProps & { children: React.ReactNode }> = ({
  children,
  title,
  headerImage,
  thumbnail,
  overrides = {},
  ...restProps
}) => {
  return (
    <BaseCard
      title={title}
      headerImage={headerImage}
      thumbnail={thumbnail}
      overrides={overrides}
      {...restProps}
    >
      {children}
    </BaseCard>
  );
};

export default CardWrapper; 