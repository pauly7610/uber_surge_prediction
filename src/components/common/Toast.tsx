import React, { useState, useEffect } from 'react';
import { Notification } from 'baseui/notification';
import { useStyletron } from 'baseui';

interface ToastProps {
  message: string;
  kind?: 'info' | 'positive' | 'warning' | 'negative';
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  kind = 'info', 
  duration = 3000, 
  onClose 
}) => {
  const [css] = useStyletron();
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  if (!visible) return null;
  
  return (
    <div className={css({
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '300px',
    })}>
      <Notification kind={kind} closeable onClose={() => setVisible(false)}>
        {message}
      </Notification>
    </div>
  );
};

export default Toast; 