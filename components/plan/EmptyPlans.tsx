import { flatColors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '../ui/Button';

interface EmptyPlansProps {
  onCreatePlan: () => void;
}

export function EmptyPlans({ onCreatePlan }: EmptyPlansProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="w-24 h-24 rounded-full bg-primary/10 items-center justify-center mb-6">
        <Ionicons name="flag-outline" size={48} color={flatColors.primary} />
      </View>

      <Text className="text-2xl font-bold text-text-primary text-center mb-2">
        No Plans Yet
      </Text>

      <Text className="text-text-secondary text-center mb-8">
        Start by telling me about a goal you'd like to achieve. I'll help you
        break it down into actionable steps!
      </Text>

      <Button
        title="Create Your First Plan"
        onPress={onCreatePlan}
        size="lg"
        leftIcon={
          <Ionicons name="add" size={20} color="#FFFFFF" />
        }
      />
    </View>
  );
}
