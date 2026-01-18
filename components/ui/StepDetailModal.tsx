import React from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import { flatColors } from '@/theme';

interface StepDetailModalProps {
  visible: boolean;
  step: {
    id: string;
    title: string;
    description?: string | null;
    due_date?: string | null;
    status: string;
    plan_title?: string;
    plan_id?: string;
  } | null;
  onClose: () => void;
  onStatusChange: (stepId: string, newStatus: 'pending' | 'in_progress' | 'completed') => void;
  onViewPlan?: (planId: string) => void;
}

export function StepDetailModal({ 
  visible, 
  step, 
  onClose, 
  onStatusChange,
  onViewPlan,
}: StepDetailModalProps) {
  if (!step) return null;

  const daysUntilDue = step.due_date 
    ? Math.ceil((new Date(step.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isUrgent = daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return flatColors.primary;
      case 'in_progress': return flatColors.warning;
      default: return flatColors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'in_progress': return 'time';
      default: return 'ellipse-outline';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        className="flex-1 bg-black/70 items-center justify-center p-4"
        onPress={onClose}
      >
        <Pressable 
          className="rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
          style={{ backgroundColor: '#1a1a1a' }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="p-5" style={{ borderBottomWidth: 1, borderBottomColor: '#333' }}>
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-lg font-bold" style={{ color: '#ffffff' }}>
                  {step.title}
                </Text>
                {step.plan_title && (
                  <TouchableOpacity 
                    onPress={() => step.plan_id && onViewPlan?.(step.plan_id)}
                    className="flex-row items-center mt-1"
                  >
                    <Ionicons name="flag-outline" size={14} color={flatColors.primary} />
                    <Text className="text-sm ml-1" style={{ color: flatColors.primary }}>
                      {step.plan_title}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={onClose} className="p-1">
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView className="max-h-80">
            <View className="p-5">
              {/* Status Badge */}
              <View className="flex-row items-center mb-4">
                <View 
                  className="flex-row items-center px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: getStatusColor(step.status) + '15' }}
                >
                  <Ionicons 
                    name={getStatusIcon(step.status) as any} 
                    size={16} 
                    color={getStatusColor(step.status)} 
                  />
                  <Text 
                    className="text-sm font-medium ml-1.5"
                    style={{ color: getStatusColor(step.status) }}
                  >
                    {getStatusLabel(step.status)}
                  </Text>
                </View>

                {daysUntilDue !== null && (
                  <View 
                    className="flex-row items-center px-3 py-1.5 rounded-full ml-2"
                    style={{ 
                      backgroundColor: isOverdue 
                        ? flatColors.error + '15' 
                        : isUrgent 
                          ? flatColors.warning + '15' 
                          : flatColors.textSecondary + '15'
                    }}
                  >
                    <Ionicons 
                      name="calendar-outline" 
                      size={14} 
                      color={isOverdue ? flatColors.error : isUrgent ? flatColors.warning : flatColors.textSecondary} 
                    />
                    <Text 
                      className="text-sm font-medium ml-1"
                      style={{ 
                        color: isOverdue ? flatColors.error : isUrgent ? flatColors.warning : flatColors.textSecondary 
                      }}
                    >
                      {isOverdue ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d left`}
                    </Text>
                  </View>
                )}
              </View>

              {/* Due Date */}
              {step.due_date && (
                <View className="flex-row items-center mb-4">
                  <Ionicons name="calendar" size={18} color="#888" />
                  <Text className="ml-2" style={{ color: '#888' }}>
                    Due: {formatDate(step.due_date)}
                  </Text>
                </View>
              )}

              {/* Description */}
              {step.description && (
                <View className="mb-4">
                  <Text className="text-sm font-semibold mb-2" style={{ color: '#fff' }}>
                    Description
                  </Text>
                  <Text className="leading-5" style={{ color: '#888' }}>
                    {step.description}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="p-5" style={{ borderTopWidth: 1, borderTopColor: '#333' }}>
            <Text className="text-sm font-semibold mb-3" style={{ color: '#fff' }}>
              Update Status
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  onStatusChange(step.id, 'pending');
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: step.status === 'pending' ? 'rgba(136, 136, 136, 0.15)' : '#252525',
                  borderWidth: 1,
                  borderColor: step.status === 'pending' ? '#888' : '#333',
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="ellipse-outline" 
                  size={20} 
                  color={step.status === 'pending' ? '#fff' : '#666'} 
                />
                <Text className="text-xs mt-1" style={{ 
                  color: step.status === 'pending' ? '#fff' : '#666',
                  fontWeight: step.status === 'pending' ? '500' : '400'
                }}>
                  Pending
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onStatusChange(step.id, 'in_progress');
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: step.status === 'in_progress' ? 'rgba(245, 158, 11, 0.15)' : '#252525',
                  borderWidth: 1,
                  borderColor: step.status === 'in_progress' ? flatColors.warning : '#333',
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="time" 
                  size={20} 
                  color={step.status === 'in_progress' ? flatColors.warning : '#666'} 
                />
                <Text className="text-xs mt-1" style={{ 
                  color: step.status === 'in_progress' ? flatColors.warning : '#666',
                  fontWeight: step.status === 'in_progress' ? '500' : '400'
                }}>
                  In Progress
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  onStatusChange(step.id, 'completed');
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: step.status === 'completed' ? 'rgba(76, 175, 80, 0.15)' : '#252525',
                  borderWidth: 1,
                  borderColor: step.status === 'completed' ? flatColors.primary : '#333',
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color={step.status === 'completed' ? flatColors.primary : '#666'} 
                />
                <Text className="text-xs mt-1" style={{ 
                  color: step.status === 'completed' ? flatColors.primary : '#666',
                  fontWeight: step.status === 'completed' ? '500' : '400'
                }}>
                  Complete
                </Text>
              </TouchableOpacity>
            </View>

            {/* View Plan Button */}
            {step.plan_id && onViewPlan && (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onViewPlan(step.plan_id!);
                }}
                className="mt-4 py-3 rounded-xl items-center flex-row justify-center"
                style={{ backgroundColor: '#252525', borderWidth: 1, borderColor: '#333' }}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-forward" size={18} color="#888" />
                <Text className="font-medium ml-2" style={{ color: '#888' }}>
                  View Full Plan
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
