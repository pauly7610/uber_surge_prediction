import React from 'react';
import { Spinner } from 'baseui/spinner';
import { useStyletron } from 'baseui';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, message = 'Loading...' }) => {
  const [css] = useStyletron();
  
  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      height: '100%',
    })}>
      <Spinner size={size} />
      {message && <div className={css({ marginTop: '10px' })}>{message}</div>}
    </div>
  );
};

export default LoadingSpinner; 