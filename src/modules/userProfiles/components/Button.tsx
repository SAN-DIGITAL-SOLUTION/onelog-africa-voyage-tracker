import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'accent';
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  ...props
}) => {
  const style = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      borderRadius: '6px',
      padding: '8px 16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    secondary: {
      backgroundColor: 'var(--color-secondary)',
      color: '#000',
      borderRadius: '6px',
      padding: '8px 16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    accent: {
      backgroundColor: 'var(--color-accent-cta)',
      color: '#fff',
      borderRadius: '6px',
      padding: '8px 16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
  };
  return (
    <button style={style[variant]} {...props}>
      {children}
    </button>
  );
};
