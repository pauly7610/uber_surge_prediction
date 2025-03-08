import React, { useEffect } from 'react';
import { useStyletron } from 'baseui';

interface BottomSheetProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  height?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  isOpen,
  onClose,
  height = 'auto',
}) => {
  const [css] = useStyletron();
  
  // Prevent body scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className={css({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--overlay-bg)',
          zIndex: 1000,
          animation: 'fadeIn var(--animation-entry)',
        })}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div
        className={css({
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--uber-white)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          boxShadow: '0 -2px 10px var(--shadow-color)',
          zIndex: 1001,
          padding: '16px',
          maxHeight: '80vh',
          overflowY: 'auto',
          height,
          animation: 'slideUp var(--animation-entry)',
        })}
      >
        {/* Handle */}
        <div
          className={css({
            width: '36px',
            height: '4px',
            backgroundColor: 'var(--light-gray)',
            borderRadius: '2px',
            margin: '0 auto 16px',
          })}
        />
        
        {children}
      </div>
    </>
  );
};

export default BottomSheet; 