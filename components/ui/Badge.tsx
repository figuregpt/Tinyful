import React from 'react';
import { Text, View } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'primary', size = 'md' }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary/20',
    secondary: 'bg-secondary/20',
    success: 'bg-primary/20',
    warning: 'bg-warning/20',
    error: 'bg-error/20',
    neutral: 'bg-surface',
  };

  const textVariantClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-primary',
    warning: 'text-warning',
    error: 'text-error',
    neutral: 'text-text-secondary',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View className={`rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      <Text
        className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
      >
        {label}
      </Text>
    </View>
  );
}
