import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { flatColors } from '@/theme';

interface ChatSession {
  id: string;
  title: string;
  date: string;
}

interface Plan {
  id: string;
  title: string;
  progress: number;
}

interface UpcomingStep {
  id: string;
  title: string;
  plan_id: string;
  plan_title: string;
  due_date: string | null;
  status: string;
}

interface SidebarProps {
  chatSessions?: ChatSession[];
  plans?: Plan[];
  upcomingSteps?: UpcomingStep[];
  onNewChat: () => void;
  onDeleteChat?: (sessionId: string) => void;
  onStepToggle?: (stepId: string) => void;
  onClose?: () => void;
}

export function Sidebar({ 
  chatSessions = [], 
  plans = [], 
  upcomingSteps = [],
  onNewChat, 
  onDeleteChat, 
  onStepToggle,
  onClose 
}: SidebarProps) {
  const pathname = usePathname();

  const handleChatSelect = (sessionId: string) => {
    // TODO: Load chat session
    router.push('/(tabs)/chat');
    onClose?.();
  };

  const handleDeleteChat = (e: any, sessionId: string) => {
    e.stopPropagation();
    onDeleteChat?.(sessionId);
  };

  const handlePlanSelect = (planId: string) => {
    router.push(`/plan/${planId}`);
    onClose?.();
  };

  return (
    <View className="flex-1 bg-[#1a1a1a]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#333]">
        <TouchableOpacity 
          className="flex-row items-center"
          onPress={() => {
            router.push('/(tabs)/plans');
            onClose?.();
          }}
          activeOpacity={0.7}
        >
          <View className="w-8 h-8 rounded-lg bg-primary items-center justify-center mr-2">
            <Ionicons name="flag" size={18} color="#FFFFFF" />
          </View>
          <Text className="text-white font-bold text-lg">Tinyful</Text>
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity onPress={onClose} className="p-2">
            <Ionicons name="close" size={24} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* New Plan Button */}
      <View className="px-3 py-3">
        <TouchableOpacity
          onPress={onNewChat}
          className="flex-row items-center px-3 py-2.5 rounded-lg border border-[#444] bg-[#2a2a2a]"
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text className="text-white ml-2 font-medium">New Plan</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {/* Recent Plans */}
        <View className="px-3 py-2">
          <Text className="text-[#888] text-xs font-semibold uppercase mb-2 px-2">
            Recent Plans
          </Text>
          {chatSessions.length > 0 ? (
            <View style={chatSessions.length > 5 ? { maxHeight: 240 } : undefined}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                scrollEnabled={chatSessions.length > 5}
              >
                {chatSessions.map((session) => (
                  <TouchableOpacity
                    key={session.id}
                    onPress={() => handleChatSelect(session.id)}
                    className="flex-row items-center px-3 py-2.5 rounded-lg mb-1 group"
                    activeOpacity={0.7}
                    style={{ position: 'relative' }}
                  >
                    <Ionicons name="flag-outline" size={16} color="#888" />
                    <View className="flex-1 ml-3 mr-2">
                      <Text className="text-white text-sm" numberOfLines={1}>
                        {session.title}
                      </Text>
                      <Text className="text-[#666] text-xs">{session.date}</Text>
                    </View>
                    {onDeleteChat && (
                      <TouchableOpacity
                        onPress={(e) => handleDeleteChat(e, session.id)}
                        className="p-1.5 rounded-md"
                        activeOpacity={0.7}
                        style={{ backgroundColor: 'transparent' }}
                      >
                        <Ionicons name="trash-outline" size={14} color="#666" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View className="px-3 py-4">
              <Text className="text-[#666] text-sm text-center">
                No plans yet
              </Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View className="h-px bg-[#333] mx-3 my-2" />

        {/* Upcoming Steps */}
        {upcomingSteps.length > 0 && (
          <>
            <View className="px-3 py-2">
              <Text className="text-[#888] text-xs font-semibold uppercase mb-2 px-2">
                Upcoming Steps
              </Text>
              <View style={{ maxHeight: 180 }}>
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {upcomingSteps.slice(0, 5).map((step) => {
                    const daysUntilDue = step.due_date 
                      ? Math.ceil((new Date(step.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                      : null;
                    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                    const isUrgent = daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0;
                    
                    return (
                      <TouchableOpacity
                        key={step.id}
                        onPress={() => {
                          router.push(`/plan/${step.plan_id}`);
                          onClose?.();
                        }}
                        className="flex-row items-center px-3 py-2 rounded-lg mb-1"
                        activeOpacity={0.7}
                      >
                        <TouchableOpacity 
                          onPress={(e) => {
                            e.stopPropagation();
                            onStepToggle?.(step.id);
                          }}
                          className="mr-2"
                        >
                          <View 
                            className={`w-4 h-4 rounded-full border-2 items-center justify-center ${
                              step.status === 'completed' ? 'bg-primary border-primary' : 'border-[#555]'
                            }`}
                          >
                            {step.status === 'completed' && (
                              <Ionicons name="checkmark" size={10} color="#fff" />
                            )}
                          </View>
                        </TouchableOpacity>
                        <View className="flex-1 mr-2">
                          <Text 
                            className={`text-white text-xs ${step.status === 'completed' ? 'line-through opacity-50' : ''}`} 
                            numberOfLines={1}
                          >
                            {step.title}
                          </Text>
                          <Text className="text-[#666] text-xs" numberOfLines={1}>
                            {step.plan_title}
                          </Text>
                        </View>
                        {daysUntilDue !== null && (
                          <Text 
                            className={`text-xs ${
                              isOverdue ? 'text-error' : isUrgent ? 'text-warning' : 'text-[#666]'
                            }`}
                          >
                            {isOverdue ? `${Math.abs(daysUntilDue)}d` : `${daysUntilDue}d`}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
            
            {/* Divider */}
            <View className="h-px bg-[#333] mx-3 my-2" />
          </>
        )}

        {/* Plans */}
        <View className="px-3 py-2 flex-1">
          <View className="flex-row items-center justify-between mb-2 px-2">
            <Text className="text-[#888] text-xs font-semibold uppercase">
              My Plans
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/plans')}>
              <Text className="text-primary text-xs">View All</Text>
            </TouchableOpacity>
          </View>
          {plans.length > 0 ? (
            <ScrollView 
              className="flex-1" 
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled
            >
              {plans.slice(0, 5).map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => handlePlanSelect(plan.id)}
                  className="flex-row items-center px-3 py-2.5 rounded-lg mb-1"
                  activeOpacity={0.7}
                >
                  <View className="w-5 h-5 rounded-full border-2 border-primary items-center justify-center">
                    {plan.progress === 100 && (
                      <Ionicons name="checkmark" size={12} color={flatColors.primary} />
                    )}
                  </View>
                  <Text className="text-white text-sm ml-3 flex-1" numberOfLines={1}>
                    {plan.title}
                  </Text>
                  <Text className="text-[#666] text-xs">{plan.progress}%</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="px-3 py-4">
              <Text className="text-[#666] text-sm text-center">
                No plans yet
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Footer */}
      <View className="px-3 py-3 border-t border-[#333]">
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          className="flex-row items-center px-3 py-2.5 rounded-lg"
          activeOpacity={0.7}
        >
          <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
            <Text className="text-white font-bold text-sm">U</Text>
          </View>
          <Text className="text-white ml-3 font-medium">Profile</Text>
          <View className="flex-1" />
          <Ionicons name="settings-outline" size={18} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
