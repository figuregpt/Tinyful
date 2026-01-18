import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, ConfirmModal } from '@/components/ui';
import { useAuthStore, usePlanStore } from '@/lib/stores';
import { theme } from '@/theme';
import '../../global.css';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { plans } = usePlanStore();
  
  const [stats, setStats] = useState({
    totalPlans: 0,
    completedPlans: 0,
    activePlans: 0,
  });

  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    const totalPlans = plans.length;
    const completedPlans = plans.filter(p => p.status === 'completed').length;
    const activePlans = plans.filter(p => p.status === 'active').length;
    
    setStats({ totalPlans, completedPlans, activePlans });
  }, [plans]);

  const handleSignOut = () => {
    setShowSignOutModal(true);
  };

  const confirmSignOut = async () => {
    setShowSignOutModal(false);
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.bgPrimary }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="px-6 py-8 items-center" style={{ backgroundColor: theme.bgSecondary }}>
          <Avatar
            name={user?.email || 'User'}
            size="xl"
          />
          <Text className="text-xl font-bold mt-4" style={{ color: theme.textPrimary }}>
            {user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text className="mt-1" style={{ color: theme.textSecondary }}>
            {user?.email}
          </Text>
        </View>

        {/* Stats */}
        <View className="px-4 py-6">
          <Text className="text-lg font-bold mb-4 px-2" style={{ color: theme.textPrimary }}>
            Your Progress
          </Text>
          
          <View className="flex-row">
            <StatCard
              icon="flag"
              label="Total Plans"
              value={stats.totalPlans}
              color={theme.primary}
            />
            <StatCard
              icon="checkmark-circle"
              label="Completed"
              value={stats.completedPlans}
              color={theme.success}
            />
            <StatCard
              icon="play-circle"
              label="Active"
              value={stats.activePlans}
              color={theme.warning}
            />
          </View>
        </View>

        {/* Settings */}
        <View className="px-4 py-2">
          <Text className="text-lg font-bold mb-4 px-2" style={{ color: theme.textPrimary }}>
            Settings
          </Text>
          
          <View className="rounded-xl overflow-hidden" style={{ backgroundColor: theme.bgSecondary }}>
            <SettingsItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => {}}
            />
            <SettingsItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => {}}
            />
            <SettingsItem
              icon="information-circle-outline"
              label="About"
              onPress={() => {}}
              isLast
            />
          </View>
        </View>

        {/* Sign Out */}
        <View className="px-6 pt-8">
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            leftIcon={
              <Ionicons name="log-out-outline" size={20} color={theme.error} />
            }
            style={{ borderColor: theme.error }}
            textStyle={{ color: theme.error }}
          />
        </View>

        {/* Version */}
        <Text className="text-center text-sm mt-6" style={{ color: theme.textMuted }}>
          Tinyful v1.0.0
        </Text>
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        visible={showSignOutModal}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        confirmVariant="danger"
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutModal(false)}
      />
    </SafeAreaView>
  );
}

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View className="flex-1 mx-1">
      <View className="items-center py-4 rounded-xl" style={{ backgroundColor: theme.bgSecondary }}>
        <View
          className="w-12 h-12 rounded-full items-center justify-center mb-2"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text className="text-2xl font-bold" style={{ color: theme.textPrimary }}>{value}</Text>
        <Text className="text-xs mt-1" style={{ color: theme.textSecondary }}>{label}</Text>
      </View>
    </View>
  );
}

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

function SettingsItem({ icon, label, onPress, isLast }: SettingsItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: theme.border } : {}}
    >
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: theme.bgTertiary }}>
        <Ionicons name={icon} size={20} color={theme.textSecondary} />
      </View>
      <Text className="flex-1 font-medium" style={{ color: theme.textPrimary }}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}
