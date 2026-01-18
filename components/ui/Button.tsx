import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
  Platform,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textStyle?: any;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  style,
  textStyle,
  ...props
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-xl font-semibold';
  
  const variantClasses = {
    primary: 'bg-primary active:bg-primary-dark',
    secondary: 'bg-secondary active:bg-secondary-dark',
    outline: 'bg-transparent border border-primary',
    ghost: 'bg-transparent',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary',
    ghost: 'text-primary',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const disabledClasses = disabled || isLoading ? 'opacity-50' : '';
  const isWeb = Platform.OS === 'web';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className || ''}`}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        isWeb ? { cursor: disabled || isLoading ? 'not-allowed' : 'pointer' } as any : {},
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : '#58CC02'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={`font-semibold ${textVariantClasses[variant]} ${textSizeClasses[size]}`}
            style={textStyle}
          >
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
