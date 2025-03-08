import React from 'react';
import { useStyletron } from 'baseui';

interface LegendProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const Legend: React.FC<LegendProps> = ({
  position = 'bottom-right',
}) => {
  const [css] = useStyletron();
  
  // Position styles
  const positionStyles = {
    'top-left': {
      top: '16px',
      left: '16px',
    },
    'top-right': {
      top: '16px',
      right: '16px',
    },
    'bottom-left': {
      bottom: '16px',
      left: '16px',
    },
    'bottom-right': {
      bottom: '16px',
      right: '16px',
    },
  };
  
  return (
    <div
      className={css({
        position: 'absolute',
        ...positionStyles[position],
        backgroundColor: 'var(--overlay-bg)',
        borderRadius: '8px',
        padding: '12px',
        zIndex: 10,
      })}
    >
      <div
        className={css({
          width: '100%',
          height: '4px',
          background: 'linear-gradient(to right, var(--baseline), var(--low-demand), var(--medium-demand), var(--high-demand))',
          borderRadius: '2px',
          marginBottom: '8px',
        })}
      />
      
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--uber-white)',
          fontSize: 'var(--font-size-caption)',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          })}
        >
          <div
            className={css({
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--baseline)',
              borderRadius: '2px',
            })}
          />
          <span>Low</span>
        </div>
        
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          })}
        >
          <div
            className={css({
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--medium-demand)',
              borderRadius: '2px',
            })}
          />
          <span>Medium</span>
        </div>
        
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          })}
        >
          <div
            className={css({
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--high-demand)',
              borderRadius: '2px',
            })}
          />
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default Legend; 