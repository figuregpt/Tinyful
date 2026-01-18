import { flatColors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface SuccessMessageProps {
  title: string;
  message?: string;
}

export function SuccessMessage({ title, message }: SuccessMessageProps) {
  return (
    <View className="items-center py-6">
      <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center mb-4">
        <Ionicons name="checkmark-circle" size={32} color={flatColors.primary} />
      </View>
      
      <Text className="text-lg font-bold text-text-primary text-center">
        {title}
      </Text>
      
      {message && (
        <Text className="text-text-secondary text-center mt-2">
          {message}
        </Text>
      )}
    </View>
  );
}
