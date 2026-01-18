import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { PriorityBadge, getNextPriority } from '../ui/PriorityBadge';
import { ProgressRing } from './ProgressRing';
import { Plan, Priority } from '@/lib/database.types';
import { flatColors, getPriorityColor } from '@/theme';

interface PlanCardProps {
  plan: Plan;
  completedSteps?: number;
  totalSteps?: number;
  onPress: () => void;
  onPriorityChange?: (planId: string, newPriority: Priority) => void;
}

export function PlanCard({
  plan,
  completedSteps = 0,
  totalSteps = 0,
  onPress,
  onPriorityChange,
}: PlanCardProps) {
  const progress = totalSteps > 0 ? completedSteps / totalSteps : 0;
  const priority = plan.priority || 'medium';
  const priorityColor = getPriorityColor(priority);

  const getStatusBadge = () => {
    switch (plan.status) {
      case 'completed':
        return <Badge label="Completed" variant="success" size="sm" />;
      case 'archived':
        return <Badge label="Archived" variant="neutral" size="sm" />;
      default:
        return <Badge label="Active" variant="primary" size="sm" />;
    }
  };

  const handlePriorityPress = () => {
    if (onPriorityChange) {
      const nextPriority = getNextPriority(priority);
      onPriorityChange(plan.id, nextPriority);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View 
        className="mb-3 overflow-hidden rounded-xl p-4"
        style={{ 
          backgroundColor: '#1a1a1a', 
          borderLeftWidth: 4, 
          borderLeftColor: priorityColor 
        }}
      >
        <View className="flex-row">
          {/* Progress Ring */}
          <View className="mr-4">
            <ProgressRing progress={progress} size={56} strokeWidth={5} />
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text
                className="text-lg font-bold flex-1 mr-2"
                numberOfLines={1}
                style={{ color: '#ffffff' }}
              >
                {plan.title}
              </Text>
              {getStatusBadge()}
            </View>

            {plan.description && (
              <Text
                className="text-sm mb-2"
                numberOfLines={2}
                style={{ color: '#888' }}
              >
                {plan.description}
              </Text>
            )}

            <View className="flex-row items-center flex-wrap">
              {/* Priority Badge */}
              <View className="mr-3">
                <PriorityBadge 
                  priority={priority} 
                  size="sm"
                  showLabel={false}
                  onPress={onPriorityChange ? handlePriorityPress : undefined}
                />
              </View>

              {plan.target_date && (
                <View className="flex-row items-center mr-3">
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color="#666"
                  />
                  <Text className="text-sm ml-1" style={{ color: '#666' }}>
                    {new Date(plan.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              )}

              <View className="flex-row items-center">
                <Ionicons
                  name="list-outline"
                  size={14}
                  color="#666"
                />
                <Text className="text-sm ml-1" style={{ color: '#666' }}>
                  {completedSteps}/{totalSteps} steps
                </Text>
              </View>
            </View>
          </View>

          {/* Arrow */}
          <View className="justify-center ml-2">
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#666"
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
