import React from 'react';
import cn from 'classnames';

interface ButtonProps {
  type?: JSX.IntrinsicElements['button']['type'];
  variant?: 'secondary' | 'primary' | 'danger';
  className?: string;
}

const Button: React.FC<ButtonProps & JSX.IntrinsicElements['button']> = ({
  type = 'button',
  variant = 'primary',
  className = '',
  children,
  ...props
}) => {
  const baseClass = `flex items-center justify-center rounded-xl px-6 py-3 cursor-pointer disabled:cursor-not-allowed focus:outline-none font-bold text-lg transition-all duration-200 shadow-md`;
  let variantClass = ``;
  if (variant === 'danger') {
    variantClass = `bg-red-500 hover:bg-red-600 focus:bg-red-400`;
  } else if (variant === 'secondary') {
    variantClass = `bg-gray-600 hover:bg-gray-500 focus:bg-gray-400`;
  } else {
    variantClass = `bg-[linear-gradient(90deg,_var(--marl-orange),_var(--marl-brown))] text-white border-none \
      hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg active:scale-95 \
      focus-visible:ring-4 focus-visible:ring-marl-orange/60`;
  }
  return (
    <button className={cn(baseClass, variantClass, className)} type={type} {...props}>
      {children}
    </button>
  );
};

export default Button;
