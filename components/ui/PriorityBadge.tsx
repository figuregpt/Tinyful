import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPriorityColor } from '@/theme/colors';
import { Priority } from '@/lib/database.types';

interface PriorityBadgeProps {
  priority: Priority;
  onPress?: () => void;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const priorityIcons: Record<Priority, keyof typeof Ionicons.glyphMap> = {
  high: 'flag',
  medium: 'flag-outline',
  low: 'remove-outline',
};

export function PriorityBadge({ 
  priority, 
  onPress, 
  size = 'md',
  showLabel = true 
}: PriorityBadgeProps) {
  const color = getPriorityColor(priority);
  const isSmall = size === 'sm';
  
  const content = (
    <View 
      className={`flex-row items-center rounded-full ${isSmall ? 'px-2 py-0.5' : 'px-3 py-1'}`}
      style={{ backgroundColor: `${color}15` }}
    >
      <Ionicons 
        name={priorityIcons[priority]} 
        size={isSmall ? 12 : 14} 
        color={color} 
      />
      {showLabel && (
        <Text 
          className={`ml-1 font-medium ${isSmall ? 'text-xs' : 'text-sm'}`}
          style={{ color }}
        >
          {priorityLabels[priority]}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Helper to cycle through priorities
export function getNextPriority(current: Priority): Priority {
  const cycle: Priority[] = ['high', 'medium', 'low'];
  const currentIndex = cycle.indexOf(current);
  return cycle[(currentIndex + 1) % cycle.length];
}
