import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge, ConfirmModal } from '@/components/ui';
import { StepItem, ProgressRing } from '@/components/plan';
import { usePlanStore } from '@/lib/stores';
import { Step } from '@/lib/database.types';
import { flatColors, theme } from '@/theme';
import '../../global.css';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 768;
  
  const {
    currentPlan,
    steps,
    isLoading,
    fetchPlanWithSteps,
    updateStepStatus,
    updatePlanStatus,
    deletePlan,
    clearCurrentPlan,
  } = usePlanStore();

  useEffect(() => {
    if (id) {
      fetchPlanWithSteps(id);
    }

    return () => {
      clearCurrentPlan();
    };
  }, [id]);

  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? completedSteps / steps.length : 0;

  // Modal state
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'primary' | 'danger';
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {},
  });

  const showModal = (
    title: string,
    message: string,
    confirmText: string,
    variant: 'primary' | 'danger',
    onConfirm: () => void
  ) => {
    setModalConfig({ visible: true, title, message, confirmText, variant, onConfirm });
  };

  const hideModal = () => {
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  const handleStepToggle = async (stepId: string, newStatus: Step['status']) => {
    await updateStepStatus(stepId, newStatus);
    
    // Auto-complete plan when all steps are completed
    const updatedSteps = steps.map(s => 
      s.id === stepId ? { ...s, status: newStatus } : s
    );
    const allCompleted = updatedSteps.every(s => s.status === 'completed');
    if (allCompleted && currentPlan && currentPlan.status === 'active') {
      await updatePlanStatus(currentPlan.id, 'completed');
    }
  };

  const handleArchivePlan = () => {
    showModal(
      'Archive Plan',
      'Archive this plan? You can find it later in your archived plans.',
      'Archive',
      'primary',
      async () => {
        hideModal();
        if (currentPlan) {
          await updatePlanStatus(currentPlan.id, 'archived');
          router.back();
        }
      }
    );
  };

  const handleDeletePlan = () => {
    showModal(
      'Delete Plan',
      'Are you sure you want to delete this plan? This action cannot be undone.',
      'Delete',
      'danger',
      async () => {
        hideModal();
        if (currentPlan) {
          await deletePlan(currentPlan.id);
          router.back();
        }
      }
    );
  };

  const getStatusBadge = () => {
    if (!currentPlan) return null;
    
    switch (currentPlan.status) {
      case 'completed':
        return <Badge label="Completed" variant="success" />;
      case 'archived':
        return <Badge label="Archived" variant="neutral" />;
      default:
        return <Badge label="Active" variant="primary" />;
    }
  };

  if (isLoading || !currentPlan) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.bgPrimary }}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.bgPrimary }}>
      <Stack.Screen
        options={{
          title: currentPlan.title,
          headerBackTitle: 'Plans',
          headerShown: !isDesktop,
        }}
      />
      
      <View className="flex-1" style={isDesktop ? { maxWidth: 900, alignSelf: 'center', width: '100%' } : undefined}>
        {/* Desktop Header */}
        {isDesktop && (
          <View className="px-6 py-4 flex-row items-center" style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="flex-row items-center mr-4"
              style={{ cursor: 'pointer' } as any}
            >
              <Ionicons name="arrow-back" size={20} color={theme.primary} />
              <Text className="ml-1 font-medium" style={{ color: theme.primary }}>Plans</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold flex-1" style={{ color: theme.textPrimary }}>{currentPlan.title}</Text>
            {getStatusBadge()}
          </View>
        )}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ 
            paddingBottom: 40,
            paddingHorizontal: isDesktop ? 24 : 0,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Plan Header */}
          <View 
            className={`rounded-xl p-4 ${isDesktop ? "mt-6" : "mx-4 mt-4"}`}
            style={{ backgroundColor: theme.bgSecondary }}
          >
            <View className="flex-row items-center">
              <ProgressRing progress={progress} size={80} strokeWidth={8} />
              
              <View className="flex-1 ml-4">
                <View className="flex-row items-center mb-1">
                  {getStatusBadge()}
                </View>
                <Text className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                  {currentPlan.title}
                </Text>
                {currentPlan.description && (
                  <Text className="mt-1" style={{ color: theme.textSecondary }}>
                    {currentPlan.description}
                  </Text>
                )}
              </View>
            </View>

            {/* Meta info */}
            <View className="flex-row mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: theme.border }}>
              {currentPlan.target_date && (
                <View className="flex-row items-center flex-1">
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={theme.textSecondary}
                  />
                  <Text className="ml-2" style={{ color: theme.textSecondary }}>
                    Target: {new Date(currentPlan.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center">
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={theme.textSecondary}
                />
                <Text className="ml-2" style={{ color: theme.textSecondary }}>
                  {completedSteps}/{steps.length} completed
                </Text>
              </View>
            </View>
          </View>

          {/* Steps */}
          <View className={isDesktop ? "mt-6" : "px-4 mt-6"}>
            <Text className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
              Steps
            </Text>
            
            <View className="rounded-xl p-4" style={{ backgroundColor: theme.bgSecondary }}>
              {steps.map((step, index) => (
                <StepItem
                  key={step.id}
                  step={step}
                  index={index}
                  onToggle={handleStepToggle}
                  isLast={index === steps.length - 1}
                />
              ))}
            </View>
          </View>

          {/* Actions */}
          {currentPlan.status !== 'completed' && (
            <View className={isDesktop ? "mt-6" : "px-4 mt-6"}>
              <Text className="text-lg font-bold mb-4" style={{ color: theme.textPrimary }}>
                Actions
              </Text>
              
              <View 
                className="flex-row gap-3"
                style={isDesktop ? { maxWidth: 400 } : undefined}
              >
                <View className="flex-1">
                  <Button
                    title="Archive"
                    variant="outline"
                    onPress={handleArchivePlan}
                    leftIcon={
                      <Ionicons name="archive-outline" size={18} color={theme.primary} />
                    }
                  />
                </View>
                <View className="flex-1">
                  <Button
                    title="Delete"
                    variant="outline"
                    onPress={handleDeletePlan}
                    leftIcon={
                      <Ionicons name="trash-outline" size={18} color={theme.error} />
                    }
                    style={{ borderColor: theme.error }}
                    textStyle={{ color: theme.error }}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Completed celebration */}
          {currentPlan.status === 'completed' && (
            <View className={isDesktop ? "mt-6" : "px-4 mt-6"}>
              <View 
                className="items-center py-6 rounded-xl"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <View 
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{ backgroundColor: theme.primary + '20' }}
                >
                  <Ionicons name="trophy" size={32} color={theme.primary} />
                </View>
                <Text className="text-xl font-bold" style={{ color: theme.textPrimary }}>
                  Plan Completed!
                </Text>
                <Text className="text-center mt-2" style={{ color: theme.textSecondary }}>
                  Congratulations on achieving your goal! Keep up the great work!
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Confirm Modal */}
      <ConfirmModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.variant}
        onConfirm={modalConfig.onConfirm}
        onCancel={hideModal}
      />
    </SafeAreaView>
  );
}
