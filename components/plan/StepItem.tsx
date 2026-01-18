import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Step } from '@/lib/database.types';
import { flatColors, theme } from '@/theme';

interface SubStep {
  title: string;
  description?: string;
}

interface StepMetadata {
  subSteps?: SubStep[];
  resources?: string[];
  tips?: string[];
  estimatedDuration?: string;
}

interface StepItemProps {
  step: Step;
  index: number;
  onToggle: (stepId: string, newStatus: Step['status']) => void;
  isLast?: boolean;
}

export function StepItem({ step, index, onToggle, isLast }: StepItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = step.status === 'completed';
  const isInProgress = step.status === 'in_progress';

  // Parse metadata from notes field
  const metadata: StepMetadata = useMemo(() => {
    if (!step.notes) return {};
    try {
      return JSON.parse(step.notes);
    } catch {
      return {};
    }
  }, [step.notes]);

  const hasDetails = (metadata.subSteps && metadata.subSteps.length > 0) || 
                     (metadata.resources && metadata.resources.length > 0) ||
                     (metadata.tips && metadata.tips.length > 0);

  const handleToggle = () => {
    let newStatus: Step['status'];
    
    if (isCompleted) {
      newStatus = 'pending';
    } else if (isInProgress) {
      newStatus = 'completed';
    } else {
      newStatus = 'in_progress';
    }
    
    onToggle(step.id, newStatus);
  };

  const getStatusIcon = () => {
    if (isCompleted) {
      return (
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary }}>
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
        </View>
      );
    }
    
    if (isInProgress) {
      return (
        <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: theme.warning }}>
          <Ionicons name="play" size={16} color="#FFFFFF" />
        </View>
      );
    }

    return (
      <View className="w-8 h-8 rounded-full items-center justify-center" style={{ borderWidth: 2, borderColor: theme.border }}>
        <Text className="font-bold" style={{ color: theme.textSecondary }}>{index + 1}</Text>
      </View>
    );
  };

  return (
    <View className="flex-row">
      {/* Left side - Status indicator and line */}
      <View className="items-center mr-3">
        <TouchableOpacity onPress={handleToggle} activeOpacity={0.7}>
          {getStatusIcon()}
        </TouchableOpacity>
        
        {!isLast && (
          <View
            className="w-0.5 flex-1 my-1"
            style={{ backgroundColor: isCompleted ? theme.primary : theme.border }}
          />
        )}
      </View>

      {/* Right side - Content */}
      <View className={`flex-1 pb-4 ${isLast ? '' : 'mb-2'}`}>
        <TouchableOpacity
          onPress={() => hasDetails && setIsExpanded(!isExpanded)}
          activeOpacity={hasDetails ? 0.7 : 1}
          className="flex-row items-center justify-between"
        >
          <View className="flex-1">
            <Text
              className="text-base font-semibold"
              style={{ 
                color: isCompleted ? theme.textMuted : theme.textPrimary,
                textDecorationLine: isCompleted ? 'line-through' : 'none'
              }}
            >
              {step.title}
            </Text>

            {step.description && (
              <Text
                className="text-sm mt-1"
                style={{ color: isCompleted ? theme.textMuted : theme.textSecondary }}
              >
                {step.description}
              </Text>
            )}
          </View>

          {hasDetails && (
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.textSecondary}
            />
          )}
        </TouchableOpacity>

        <View className="flex-row items-center mt-2 flex-wrap">
          {metadata.estimatedDuration && (
            <View className="flex-row items-center mr-4">
              <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
              <Text className="text-sm ml-1" style={{ color: theme.textSecondary }}>
                {metadata.estimatedDuration}
              </Text>
            </View>
          )}

          {step.due_date && (
            <View className="flex-row items-center mr-4">
              <Ionicons
                name="calendar-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text className="text-sm ml-1" style={{ color: theme.textSecondary }}>
                {new Date(step.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}

          <View className="flex-row items-center">
            <View
              className="w-2 h-2 rounded-full mr-1"
              style={{ 
                backgroundColor: isCompleted 
                  ? theme.primary 
                  : isInProgress 
                    ? theme.warning 
                    : theme.border 
              }}
            />
            <Text className="text-sm capitalize" style={{ color: theme.textSecondary }}>
              {step.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Expanded Content */}
        {isExpanded && hasDetails && (
          <View className="mt-3 rounded-xl p-3" style={{ backgroundColor: theme.bgTertiary }}>
            {/* Sub-Steps */}
            {metadata.subSteps && metadata.subSteps.length > 0 && (
              <View className="mb-3">
                <Text className="font-semibold text-sm mb-2" style={{ color: theme.textPrimary }}>📋 Tasks:</Text>
                {metadata.subSteps.map((subStep, idx) => (
                  <View key={idx} className="flex-row items-start mb-2">
                    <View className="w-5 h-5 rounded-full items-center justify-center mr-2 mt-0.5" style={{ backgroundColor: theme.primary + '30' }}>
                      <Text className="text-xs font-bold" style={{ color: theme.primary }}>{idx + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-medium" style={{ color: theme.textPrimary }}>{subStep.title}</Text>
                      {subStep.description && (
                        <Text className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>{subStep.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Resources */}
            {metadata.resources && metadata.resources.length > 0 && (
              <View className="mb-3">
                <Text className="font-semibold text-sm mb-2" style={{ color: theme.textPrimary }}>📚 Resources:</Text>
                {metadata.resources.map((resource, idx) => (
                  <View key={idx} className="flex-row items-center mb-1">
                    <Text className="mr-2" style={{ color: theme.primary }}>•</Text>
                    <Text className="text-sm" style={{ color: theme.textSecondary }}>{resource}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tips */}
            {metadata.tips && metadata.tips.length > 0 && (
              <View>
                <Text className="font-semibold text-sm mb-2" style={{ color: theme.textPrimary }}>💡 Tips:</Text>
                {metadata.tips.map((tip, idx) => (
                  <View key={idx} className="flex-row items-start mb-1">
                    <Text className="mr-2" style={{ color: theme.warning }}>•</Text>
                    <Text className="text-sm flex-1" style={{ color: theme.textSecondary }}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
