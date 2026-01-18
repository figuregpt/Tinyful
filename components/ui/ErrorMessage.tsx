import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { flatColors } from '@/theme';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  fullScreen = false,
}: ErrorMessageProps) {
  const content = (
    <>
      <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4">
        <Ionicons name="alert-circle" size={32} color={flatColors.error} />
      </View>
      
      <Text className="text-lg font-bold text-text-primary text-center mb-2">
        {title}
      </Text>
      
      <Text className="text-text-secondary text-center mb-6">
        {message}
      </Text>

      {onRetry && (
        <Button title="Try Again" onPress={onRetry} variant="outline" />
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        {content}
      </View>
    );
  }

  return (
    <View className="items-center justify-center py-8 px-4">
      {content}
    </View>
  );
}
