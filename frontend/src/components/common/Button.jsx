import React from 'react';

export default function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    ghost: 'btn-ghost'
  }[variant] || 'btn-secondary';

  const sizeClass = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }[size] || '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <span className="btn-icon">{typeof Icon === 'function' ? <Icon size={15} /> : Icon}</span>}
      {children}
    </button>
  );
}
