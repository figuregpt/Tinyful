import { flatColors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 768;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: flatColors.primary,
        tabBarInactiveTintColor: flatColors.textSecondary,
        tabBarStyle: isDesktop ? { display: 'none' } : {
          backgroundColor: '#FFFFFF',
          borderTopColor: flatColors.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 6,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: flatColors.textPrimary,
          fontSize: 16,
        },
        headerShadowVisible: false,
        headerShown: !isDesktop,
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          headerTitle: 'Tino',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          headerTitle: 'My Plans',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size - 2} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
