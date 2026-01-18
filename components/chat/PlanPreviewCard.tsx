import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Resource {
  type?: string;
  name: string;
  url?: string;
  description?: string;
  free?: boolean;
}

interface SubStep {
  title: string;
  description?: string;
}

interface Action {
  title: string;
  description?: string;
  duration?: string;
  deliverable?: string;
  resources?: Resource[];
}

interface PlanStep {
  title: string;
  description?: string;
  dueDate?: string;
  estimatedDuration?: string;
  week?: number;
  icon?: string;
  weeklyGoal?: string;
  checkpoint?: string;
  actions?: Action[];
  subSteps?: SubStep[];
  tips?: string[];
  resources?: (string | Resource)[];
}

interface DetailedPlan {
  title: string;
  description?: string;
  targetDate?: string;
  totalWeeks?: number;
  difficulty?: string;
  estimatedCost?: string;
  steps: PlanStep[];
  bonusResources?: Resource[];
  successMetrics?: string[];
}

// Helper to open links
const openLink = (url: string) => {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
};

// Resource Link Component
function ResourceLink({ resource }: { resource: Resource }) {
  const getIcon = () => {
    switch (resource.type) {
      case 'course': return 'school';
      case 'video': return 'play-circle';
      case 'docs': return 'document-text';
      case 'tool': return 'build';
      case 'book': return 'book';
      case 'community': return 'people';
      case 'podcast': return 'mic';
      default: return 'link';
    }
  };

  return (
    <TouchableOpacity
      onPress={() => resource.url && openLink(resource.url)}
      className="flex-row items-center rounded-lg p-2 mb-1"
      style={{ backgroundColor: theme.bgTertiary, borderWidth: 1, borderColor: theme.border }}
      activeOpacity={0.7}
    >
      <View 
        className="w-8 h-8 rounded-full items-center justify-center mr-2"
        style={{ backgroundColor: theme.primary + '20' }}
      >
        <Ionicons name={getIcon() as any} size={16} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium" style={{ color: theme.textPrimary }}>{resource.name}</Text>
        {resource.description && (
          <Text className="text-xs" numberOfLines={1} style={{ color: theme.textSecondary }}>{resource.description}</Text>
        )}
      </View>
      {resource.free && (
        <Badge label="Free" variant="success" size="sm" />
      )}
      {resource.url && (
        <Ionicons name="open-outline" size={14} color={theme.textSecondary} style={{ marginLeft: 8 }} />
      )}
    </TouchableOpacity>
  );
}

interface PlanPreviewCardProps {
  plan: DetailedPlan;
  onSave: () => void;
  onDiscard: () => void;
  isLoading?: boolean;
}

export function PlanPreviewCard({
  plan,
  onSave,
  onDiscard,
  isLoading,
}: PlanPreviewCardProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  return (
    <View className="mx-4 my-2 rounded-2xl p-4" style={{ backgroundColor: theme.bgSecondary }}>
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: theme.primary + '20' }}
        >
          <Ionicons name="checkmark-circle" size={28} color={theme.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-xs uppercase font-bold tracking-wide" style={{ color: theme.primary }}>
            Your Plan is Ready!
          </Text>
        </View>
      </View>

      {plan.description && (
        <Text className="mb-4 leading-5" style={{ color: theme.textSecondary }}>{plan.description}</Text>
      )}

      {/* Stats Row */}
      <View className="flex-row mb-4 rounded-xl p-3" style={{ backgroundColor: theme.bgTertiary }}>
        {plan.targetDate && (
          <View className="flex-1 items-center" style={{ borderRightWidth: 1, borderRightColor: theme.border }}>
            <Ionicons name="calendar" size={20} color={theme.primary} />
            <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>Target</Text>
            <Text className="font-semibold text-sm" style={{ color: theme.textPrimary }}>
              {new Date(plan.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        )}
        <View className="flex-1 items-center" style={{ borderRightWidth: plan.difficulty || plan.estimatedCost ? 1 : 0, borderRightColor: theme.border }}>
          <Ionicons name="layers" size={20} color={theme.primary} />
          <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>Weeks</Text>
          <Text className="font-semibold text-sm" style={{ color: theme.textPrimary }}>{plan.totalWeeks || plan.steps.length}</Text>
        </View>
        {plan.difficulty && (
          <View className="flex-1 items-center" style={{ borderRightWidth: plan.estimatedCost ? 1 : 0, borderRightColor: theme.border }}>
            <Ionicons name="speedometer" size={20} color={theme.primary} />
            <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>Level</Text>
            <Text className="font-semibold text-sm" style={{ color: theme.textPrimary }}>{plan.difficulty}</Text>
          </View>
        )}
        {plan.estimatedCost && (
          <View className="flex-1 items-center">
            <Ionicons name="wallet" size={20} color={theme.primary} />
            <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>Cost</Text>
            <Text className="font-semibold text-sm" style={{ color: theme.textPrimary }}>{plan.estimatedCost}</Text>
          </View>
        )}
      </View>

      {/* Steps */}
      <ScrollView className="max-h-80" showsVerticalScrollIndicator={false}>
        {plan.steps.map((step, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setExpandedStep(expandedStep === index ? null : index)}
            activeOpacity={0.7}
          >
            <View 
              className="mb-3 rounded-xl"
              style={{ 
                backgroundColor: expandedStep === index ? theme.primary + '10' : theme.bgTertiary,
                borderWidth: 1,
                borderColor: expandedStep === index ? theme.primary : theme.border
              }}
            >
              {/* Step Header */}
              <View className="flex-row items-center p-3">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: theme.primary }}
                >
                  {step.icon ? (
                    <Text className="text-lg">{step.icon}</Text>
                  ) : (
                    <Text className="text-white font-bold">{step.week || index + 1}</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: theme.textPrimary }}>{step.title}</Text>
                  {step.estimatedDuration && (
                    <Text className="text-xs" style={{ color: theme.textSecondary }}>{step.estimatedDuration}</Text>
                  )}
                </View>
                <Ionicons 
                  name={expandedStep === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </View>

              {/* Expanded Content */}
              {expandedStep === index && (
                <View className="px-3 pb-3 mt-0 pt-3" style={{ borderTopWidth: 1, borderTopColor: theme.border + '50' }}>
                  {step.description && (
                    <Text className="text-sm mb-3 leading-5" style={{ color: theme.textSecondary }}>{step.description}</Text>
                  )}

                  {/* Weekly Goal */}
                  {step.weeklyGoal && (
                    <View className="rounded-lg p-3 mb-3" style={{ backgroundColor: theme.primary + '15' }}>
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="flag" size={14} color={theme.primary} />
                        <Text className="font-semibold text-sm ml-1" style={{ color: theme.primary }}>Weekly Goal</Text>
                      </View>
                      <Text className="text-sm" style={{ color: theme.textPrimary }}>{step.weeklyGoal}</Text>
                    </View>
                  )}

                  {/* Sub-Steps */}
                  {step.subSteps && step.subSteps.length > 0 && (
                    <View className="mb-3">
                      <Text className="font-semibold text-sm mb-2" style={{ color: theme.textPrimary }}>📋 Tasks:</Text>
                      {step.subSteps.map((subStep, subIndex) => (
                        <View key={subIndex} className="rounded-lg p-3 mb-2" style={{ backgroundColor: theme.bgPrimary }}>
                          <View className="flex-row items-start">
                            <View 
                              className="w-6 h-6 rounded-full items-center justify-center mr-2"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Text className="text-white text-xs font-bold">{subIndex + 1}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="font-medium" style={{ color: theme.textPrimary }}>{subStep.title}</Text>
                            </View>
                          </View>
                          {subStep.description && (
                            <Text className="text-sm mt-2 ml-8 leading-5" style={{ color: theme.textSecondary }}>{subStep.description}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Actions (legacy support) */}
                  {step.actions && step.actions.length > 0 && !step.subSteps && (
                    <View className="mb-3">
                      <Text className="font-semibold text-sm mb-2" style={{ color: theme.textPrimary }}>📋 Tasks:</Text>
                      {step.actions.map((action, actionIndex) => (
                        <View key={actionIndex} className="rounded-lg p-3 mb-2" style={{ backgroundColor: theme.bgPrimary }}>
                          <View className="flex-row items-start">
                            <View 
                              className="w-6 h-6 rounded-full items-center justify-center mr-2"
                              style={{ backgroundColor: theme.primary }}
                            >
                              <Text className="text-white text-xs font-bold">{actionIndex + 1}</Text>
                            </View>
                            <View className="flex-1">
                              <Text className="font-medium" style={{ color: theme.textPrimary }}>{action.title}</Text>
                              {action.duration && (
                                <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>⏱ {action.duration}</Text>
                              )}
                            </View>
                          </View>
                          {action.description && (
                            <Text className="text-sm mt-2 leading-5" style={{ color: theme.textSecondary }}>{action.description}</Text>
                          )}
                          {action.deliverable && (
                            <View className="flex-row items-center mt-2 rounded p-2" style={{ backgroundColor: theme.success + '15' }}>
                              <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                              <Text className="text-xs ml-1 font-medium" style={{ color: theme.success }}>Deliverable: {action.deliverable}</Text>
                            </View>
                          )}
                          {/* Action Resources */}
                          {action.resources && action.resources.length > 0 && (
                            <View className="mt-2">
                              <Text className="text-xs font-medium mb-1" style={{ color: theme.textSecondary }}>📚 Resources:</Text>
                              {action.resources.map((resource, resIdx) => (
                                <ResourceLink key={resIdx} resource={resource} />
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Tips */}
                  {step.tips && step.tips.length > 0 && (
                    <View className="rounded-lg p-3 mb-2" style={{ backgroundColor: theme.warning + '15' }}>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="bulb" size={16} color={theme.warning} />
                        <Text className="font-semibold text-sm ml-1" style={{ color: theme.warning }}>Pro Tips</Text>
                      </View>
                      {step.tips.map((tip, tipIndex) => (
                        <View key={tipIndex} className="flex-row items-start mb-1">
                          <Text className="mr-2" style={{ color: theme.warning }}>💡</Text>
                          <Text className="text-sm flex-1" style={{ color: theme.textPrimary }}>{tip}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Step Resources */}
                  {step.resources && step.resources.length > 0 && (
                    <View className="rounded-lg p-3 mb-2" style={{ backgroundColor: theme.secondary + '15' }}>
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="library" size={16} color={theme.secondary} />
                        <Text className="font-semibold text-sm ml-1" style={{ color: theme.secondary }}>Resources & Tools</Text>
                      </View>
                      {step.resources.map((resource, resIndex) => (
                        typeof resource === 'string' ? (
                          <Text key={resIndex} className="text-sm mb-1" style={{ color: theme.textSecondary }}>• {resource}</Text>
                        ) : (
                          <ResourceLink key={resIndex} resource={resource} />
                        )
                      ))}
                    </View>
                  )}

                  {/* Checkpoint */}
                  {step.checkpoint && (
                    <View className="rounded-lg p-3 mt-2" style={{ backgroundColor: theme.success + '15' }}>
                      <View className="flex-row items-center mb-1">
                        <Ionicons name="checkbox" size={16} color={theme.success} />
                        <Text className="font-semibold text-sm ml-1" style={{ color: theme.success }}>Checkpoint</Text>
                      </View>
                      <Text className="text-sm" style={{ color: theme.textPrimary }}>{step.checkpoint}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bonus Resources */}
      {plan.bonusResources && plan.bonusResources.length > 0 && (
        <View className="mb-4">
          <Text className="font-bold mb-2 text-base" style={{ color: theme.textPrimary }}>
            🎁 Bonus Resources
          </Text>
          <View className="rounded-xl p-3" style={{ backgroundColor: theme.bgTertiary }}>
            {plan.bonusResources.map((resource, idx) => (
              <ResourceLink key={idx} resource={resource} />
            ))}
          </View>
        </View>
      )}

      {/* Success Metrics */}
      {plan.successMetrics && plan.successMetrics.length > 0 && (
        <View className="mb-4">
          <Text className="font-bold mb-2 text-base" style={{ color: theme.textPrimary }}>
            📊 How to Track Progress
          </Text>
          <View className="rounded-xl p-3" style={{ backgroundColor: theme.bgTertiary }}>
            {plan.successMetrics.map((metric, idx) => (
              <View key={idx} className="flex-row items-center mb-1">
                <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                <Text className="text-sm ml-2" style={{ color: theme.textPrimary }}>{metric}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: theme.border }}>
        <View className="flex-1 mr-2">
          <Button
            title="Discard"
            variant="outline"
            onPress={onDiscard}
            disabled={isLoading}
          />
        </View>
        <View className="flex-1">
          <Button
            title="Save Plan"
            onPress={onSave}
            isLoading={isLoading}
          />
        </View>
      </View>
    </View>
  );
}
