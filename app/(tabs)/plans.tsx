import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Text,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { PlanCard, EmptyPlans } from '@/components/plan';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StepDetailModal } from '@/components/ui/StepDetailModal';
import { useAuthStore, usePlanStore } from '@/lib/stores';
import { supabase } from '@/lib/supabase';
import { flatColors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Plan, Priority } from '@/lib/database.types';
import { StepWithPlan } from '@/lib/stores/plan-store';
import '../../global.css';

interface PlanWithStepCount extends Plan {
  completedSteps: number;
  totalSteps: number;
}

// Upcoming Step Item component
function UpcomingStepItem({ 
  step, 
  onPress,
}: { 
  step: StepWithPlan;
  onPress: () => void;
}) {
  const daysUntilDue = step.due_date 
    ? Math.ceil((new Date(step.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isUrgent = daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0;

  // Status icon and color
  const getStatusStyle = () => {
    switch (step.status) {
      case 'completed':
        return { bg: flatColors.primary, border: flatColors.primary, icon: 'checkmark', iconColor: '#fff' };
      case 'in_progress':
        return { bg: flatColors.warning, border: flatColors.warning, icon: 'time', iconColor: '#fff' };
      default:
        return { bg: 'transparent', border: '#444', icon: null, iconColor: '#888' };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center py-3 px-4"
      style={{ borderBottomWidth: 1, borderBottomColor: '#252525' }}
    >
      {/* Status indicator - clicking also opens modal */}
      <View 
        className="w-5 h-5 rounded-full items-center justify-center mr-3"
        style={{ 
          backgroundColor: statusStyle.bg, 
          borderWidth: 2, 
          borderColor: statusStyle.border 
        }}
      >
        {statusStyle.icon && (
          <Ionicons name={statusStyle.icon as any} size={10} color={statusStyle.iconColor} />
        )}
      </View>
      
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text 
            className="text-sm font-medium"
            numberOfLines={1}
            style={{ 
              flex: 1, 
              color: step.status === 'completed' ? '#666' : '#fff',
              textDecorationLine: step.status === 'completed' ? 'line-through' : 'none'
            }}
          >
            {step.title}
          </Text>
          {/* Status badge */}
          {step.status === 'in_progress' && (
            <View className="ml-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)' }}>
              <Text className="text-[10px] font-medium" style={{ color: flatColors.warning }}>In Progress</Text>
            </View>
          )}
        </View>
        <Text className="text-xs" numberOfLines={1} style={{ color: '#666' }}>
          {step.plan_title}
        </Text>
      </View>
      
      {daysUntilDue !== null && (
        <View 
          className="px-2 py-1 rounded-full"
          style={{ 
            backgroundColor: isOverdue ? 'rgba(239, 68, 68, 0.15)' : isUrgent ? 'rgba(245, 158, 11, 0.15)' : '#252525' 
          }}
        >
          <Text 
            className="text-xs font-medium"
            style={{ 
              color: isOverdue ? flatColors.error : isUrgent ? flatColors.warning : '#666' 
            }}
          >
            {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 768;
  const isLargeDesktop = isWeb && width >= 1200;
  
  const { user } = useAuthStore();
  const { 
    plans, 
    upcomingSteps,
    fetchPlans, 
    fetchUpcomingSteps,
    updatePlanPriority,
    updateStepStatus,
    isLoading 
  } = usePlanStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [plansWithCounts, setPlansWithCounts] = useState<PlanWithStepCount[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('active');
  const [selectedStep, setSelectedStep] = useState<StepWithPlan | null>(null);
  const [stepModalVisible, setStepModalVisible] = useState(false);

  const filteredPlans = plansWithCounts.filter(plan => {
    if (filter === 'all') return plan.status !== 'archived';
    if (filter === 'active') return plan.status === 'active';
    if (filter === 'completed') return plan.status === 'completed';
    if (filter === 'archived') return plan.status === 'archived';
    return true;
  });

  // Fix old 2025 dates to 2026 (one-time migration)
  const fixOldDates = async () => {
    if (!user) return;

    // Fix plans with 2025 dates
    const { data: oldPlans } = await supabase
      .from('plans')
      .select('id, target_date')
      .eq('user_id', user.id)
      .gte('target_date', '2025-01-01')
      .lt('target_date', '2026-01-01');

    for (const plan of oldPlans || []) {
      if (plan.target_date) {
        const oldDate = new Date(plan.target_date);
        oldDate.setFullYear(oldDate.getFullYear() + 1);
        const newDate = oldDate.toISOString().split('T')[0];
        
        await supabase
          .from('plans')
          .update({ target_date: newDate })
          .eq('id', plan.id);
      }
    }

    // Fix steps with 2025 dates  
    const { data: oldSteps } = await supabase
      .from('steps')
      .select('id, due_date, plan_id')
      .gte('due_date', '2025-01-01')
      .lt('due_date', '2026-01-01');

    // Filter steps that belong to user's plans
    const userPlanIds = plans.map(p => p.id);
    const userSteps = (oldSteps || []).filter(s => userPlanIds.includes(s.plan_id));

    for (const step of userSteps) {
      if (step.due_date) {
        const oldDate = new Date(step.due_date);
        oldDate.setFullYear(oldDate.getFullYear() + 1);
        const newDate = oldDate.toISOString().split('T')[0];
        
        await supabase
          .from('steps')
          .update({ due_date: newDate })
          .eq('id', step.id);
      }
    }

    // Reload data after fixing
    if (oldPlans?.length || userSteps.length) {
      console.log(`Fixed dates: ${oldPlans?.length || 0} plans, ${userSteps.length} steps`);
      loadData();
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Run date fix once after plans are loaded
  useEffect(() => {
    if (user && plans.length > 0) {
      fixOldDates();
    }
  }, [user, plans.length > 0]);

  const loadData = async () => {
    if (!user) return;
    await Promise.all([
      fetchPlans(user.id),
      fetchUpcomingSteps(user.id),
    ]);
  };

  useEffect(() => {
    const fetchStepCounts = async () => {
      if (plans.length === 0) {
        setPlansWithCounts([]);
        return;
      }

      const countsPromises = plans.map(async (plan) => {
        const { data: steps } = await supabase
          .from('steps')
          .select('status')
          .eq('plan_id', plan.id);

        const stepsArray = steps as Array<{ status: string }> | null;
        const totalSteps = stepsArray?.length || 0;
        const completedSteps = stepsArray?.filter(s => s.status === 'completed').length || 0;

        return {
          ...plan,
          completedSteps,
          totalSteps,
        };
      });

      const results = await Promise.all(countsPromises);
      setPlansWithCounts(results);
    };

    fetchStepCounts();
  }, [plans]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePlanPress = (planId: string) => {
    router.push(`/plan/${planId}`);
  };

  const handleCreatePlan = () => {
    router.push('/(tabs)/chat');
  };

  const handlePriorityChange = useCallback(async (planId: string, newPriority: Priority) => {
    await updatePlanPriority(planId, newPriority);
  }, [updatePlanPriority]);

  const handleStepToggle = async (stepId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await updateStepStatus(stepId, newStatus as 'pending' | 'completed');
    if (user) {
      fetchUpcomingSteps(user.id);
    }
  };

  const handleStepPress = (step: StepWithPlan) => {
    setSelectedStep(step);
    setStepModalVisible(true);
  };

  const handleStepStatusChange = async (stepId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
    await updateStepStatus(stepId, newStatus);
    if (user) {
      fetchUpcomingSteps(user.id);
      fetchPlans(user.id);
    }
  };

  const handleViewPlan = (planId: string) => {
    setStepModalVisible(false);
    router.push(`/plan/${planId}`);
  };

  if (isLoading && plans.length === 0) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0d0d0d' }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={flatColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0d0d0d' }}>
      {/* Step Detail Modal */}
      <StepDetailModal
        visible={stepModalVisible}
        step={selectedStep}
        onClose={() => setStepModalVisible(false)}
        onStatusChange={handleStepStatusChange}
        onViewPlan={handleViewPlan}
      />

      <View className="flex-1" style={isDesktop ? { maxWidth: 1400, alignSelf: 'center', width: '100%' } : undefined}>
        {/* Header */}
        {isDesktop && (
          <View className="px-6 py-4 flex-row items-center justify-between" style={{ borderBottomWidth: 1, borderBottomColor: '#222' }}>
            <View>
              <Text className="text-2xl font-bold" style={{ color: '#ffffff' }}>Dashboard</Text>
              <Text className="text-sm mt-1" style={{ color: '#888' }}>
                {filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'} • Track your progress
              </Text>
            </View>
            <Button
              title="New Plan"
              onPress={handleCreatePlan}
              size="sm"
            />
          </View>
        )}

        {plansWithCounts.length === 0 ? (
          <EmptyPlans onCreatePlan={handleCreatePlan} />
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ 
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[flatColors.primary]}
                tintColor={flatColors.primary}
              />
            }
          >
            {/* Upcoming Steps Section */}
            {upcomingSteps.length > 0 && (
              <View className={`${isDesktop ? 'px-6' : 'px-4'} pt-4`}>
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={20} color="#ffffff" />
                    <Text className="text-lg font-bold ml-2" style={{ color: '#ffffff' }}>
                      Upcoming Steps
                    </Text>
                  </View>
                  <Text className="text-sm" style={{ color: '#888' }}>
                    {upcomingSteps.length} pending
                  </Text>
                </View>
                
                <View className="rounded-xl mb-4" style={{ backgroundColor: '#1a1a1a' }}>
                  {upcomingSteps.slice(0, 5).map((step) => (
                    <UpcomingStepItem
                      key={step.id}
                      step={step}
                      onPress={() => handleStepPress(step)}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Filter Tabs */}
            <View className={`${isDesktop ? 'px-6' : 'px-4'} py-3`} style={{ borderBottomWidth: 1, borderBottomColor: '#222' }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row' }}
              >
                {(['all', 'active', 'completed', 'archived'] as const).map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setFilter(tab)}
                    className="mr-4 pb-2"
                    style={filter === tab ? { borderBottomWidth: 2, borderBottomColor: flatColors.primary } : {}}
                    activeOpacity={0.7}
                  >
                    <Text
                      className="text-sm font-medium capitalize"
                      style={{ color: filter === tab ? flatColors.primary : '#888' }}
                    >
                      {tab === 'all' ? 'All Plans' : tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Plans Grid */}
            <View className={`${isDesktop ? 'px-6' : 'px-4'} pt-4`}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold" style={{ color: '#ffffff' }}>
                  My Plans
                </Text>
              </View>
              
              {/* Grid Layout */}
              <View style={isDesktop ? { 
                flexDirection: 'row', 
                flexWrap: 'wrap', 
                marginHorizontal: -8 
              } : undefined}>
                {filteredPlans.map((plan) => (
                  <View 
                    key={plan.id} 
                    style={isDesktop ? { 
                      width: isLargeDesktop ? '33.33%' : '50%',
                      padding: 8,
                    } : { marginBottom: 12 }}
                  >
                    <PlanCard
                      plan={plan}
                      completedSteps={plan.completedSteps}
                      totalSteps={plan.totalSteps}
                      onPress={() => handlePlanPress(plan.id)}
                      onPriorityChange={handlePriorityChange}
                    />
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
