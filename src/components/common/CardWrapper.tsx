import React from 'react';
import { useStyletron } from 'baseui';

interface CardWrapperProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

const CardWrapper: React.FC<CardWrapperProps> = ({ title, subtitle, children }) => {
  const [css] = useStyletron();
  
  return (
    <div className={css({
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    })}>
      {title && (
        <div className={css({
          padding: '16px',
          borderBottom: subtitle ? '1px solid #f0f0f0' : 'none',
        })}>
          <div className={css({
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: subtitle ? '4px' : '0',
          })}>
            {title}
          </div>
          
          {subtitle && (
            <div className={css({
              fontSize: '14px',
              color: '#666',
            })}>
              {subtitle}
            </div>
          )}
        </div>
      )}
      
      <div className={css({
        padding: '16px',
      })}>
        {children}
      </div>
    </div>
  );
};

export default CardWrapper; 