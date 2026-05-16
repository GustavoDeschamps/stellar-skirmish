import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-100',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  ghost: 'bg-transparent hover:bg-gray-800 text-gray-300',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`
        rounded-lg font-medium transition-colors duration-150
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
