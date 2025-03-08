import React from 'react';
import { useStyletron } from 'baseui';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  type = 'button',
}) => {
  const [css] = useStyletron();
  
  // Size styles
  const sizeStyles = {
    small: {
      padding: '8px 12px',
      fontSize: 'var(--font-size-caption)',
    },
    medium: {
      padding: '10px 16px',
      fontSize: 'var(--font-size-body)',
    },
    large: {
      padding: '12px 20px',
      fontSize: 'var(--font-size-heading-small)',
    },
  };
  
  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? 'var(--medium-gray)' : 'var(--uber-black)',
      color: 'var(--uber-white)',
      border: 'none',
    },
    secondary: {
      backgroundColor: 'var(--uber-white)',
      color: disabled ? 'var(--medium-gray)' : 'var(--uber-black)',
      border: `1px solid ${disabled ? 'var(--medium-gray)' : 'var(--uber-black)'}`,
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: disabled ? 'var(--medium-gray)' : 'var(--uber-black)',
      border: 'none',
    },
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={css({
        ...sizeStyles[size],
        ...variantStyles[variant],
        borderRadius: '8px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all var(--animation-standard)',
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-family-base)',
        ':hover': !disabled ? {
          opacity: 0.9,
        } : {},
        ':active': !disabled ? {
          transform: 'scale(0.98)',
        } : {},
      })}
    >
      {children}
    </button>
  );
};

export default Button; 