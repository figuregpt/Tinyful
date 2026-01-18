import React, { forwardRef } from 'react';
import {
    Platform,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, size = 'md', className, style, ...props }, ref) => {
    const hasError = !!error;
    const isWeb = Platform.OS === 'web';

    const paddingClass = size === 'sm' ? 'py-2' : 'py-2.5';
    const textSize = size === 'sm' ? 'text-sm' : 'text-sm';

    return (
      <View className="w-full">
        {label && (
          <Text className="text-text-primary font-semibold mb-1.5 text-xs">
            {label}
          </Text>
        )}
        <View
          className={`flex-row items-center bg-surface rounded-xl border ${
            hasError ? 'border-error' : 'border-border'
          }`}
        >
          {leftIcon && <View className="pl-3">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={`flex-1 px-3 ${paddingClass} text-text-primary ${textSize} ${
              leftIcon ? 'pl-2' : ''
            } ${rightIcon ? 'pr-2' : ''}`}
            placeholderTextColor="#777777"
            style={[
              isWeb ? { outlineStyle: 'none' } as any : {},
              style,
            ]}
            {...props}
          />
          {rightIcon && <View className="pr-3">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="text-error text-xs mt-1">{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
