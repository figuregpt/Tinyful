import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { flatColors } from '@/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const content = (
    <>
      <ActivityIndicator size={size} color={flatColors.primary} />
      {message && (
        <Text className="text-text-secondary mt-3 text-center">{message}</Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        {content}
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8">
      {content}
    </View>
  );
}
