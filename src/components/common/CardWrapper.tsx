import React from 'react';
import { useStyletron } from 'baseui';

interface CardWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: string;
  marginBottom?: string;
}

const CardWrapper: React.FC<CardWrapperProps> = ({ 
  children, 
  title, 
  subtitle,
  padding = '16px',
  marginBottom = '16px'
}) => {
  const [css] = useStyletron();
  
  return (
    <div className={css({
      backgroundColor: 'var(--uber-white)',
      borderRadius: '8px',
      boxShadow: '0 2px 4px var(--shadow-color)',
      padding,
      marginBottom,
    })}>
      {title && (
        <div className={css({
          marginBottom: subtitle ? '4px' : '16px',
        })}>
          <h2 className={css({
            fontSize: 'var(--font-size-heading-medium)',
            lineHeight: 'var(--line-height-heading-medium)',
            fontWeight: 700,
            margin: 0,
            color: 'var(--uber-black)',
          })}>
            {title}
          </h2>
        </div>
      )}
      
      {subtitle && (
        <div className={css({
          marginBottom: '16px',
        })}>
          <p className={css({
            fontSize: 'var(--font-size-body)',
            lineHeight: 'var(--line-height-body)',
            margin: 0,
            color: 'var(--medium-gray)',
          })}>
            {subtitle}
          </p>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default CardWrapper; 