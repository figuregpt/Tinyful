import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className,
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg shadow-black/10',
    outline: 'bg-white border border-border',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <View
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
