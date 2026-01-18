import React, { useState, useEffect } from 'react';
import { View, Platform, useWindowDimensions, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Sidebar } from './Sidebar';
import { usePlanStore, useAuthStore, useChatStore } from '@/lib/stores';
import { supabase } from '@/lib/supabase';
import { deleteChatSession } from '@/lib/api/chat';

interface ChatSessionData {
  id: string;
  title: string;
  date: string;
}

interface DesktopLayoutProps {
  children: React.ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 1024;
  const isTablet = isWeb && width >= 768 && width < 1024;
  const isMobile = !isDesktop && !isTablet;
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSessionData[]>([]);
  const { plans, upcomingSteps, fetchPlans, fetchUpcomingSteps, updateStepStatus } = usePlanStore();
  const { user } = useAuthStore();
  const { clearChat, initializeSession } = useChatStore();

  const { sessionId } = useChatStore();

  // Fetch plans when user is available
  useEffect(() => {
    if (user) {
      fetchPlans(user.id);
      fetchUpcomingSteps(user.id);
      fetchChatSessions();
    }
  }, [user]);

  // Refresh chat sessions when a new session is created
  useEffect(() => {
    if (user && sessionId) {
      fetchChatSessions();
    }
  }, [sessionId]);

  // Fetch chat sessions from Supabase
  const fetchChatSessions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          created_at,
          plan_id,
          plans (title),
          messages (content, role)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const sessions: ChatSessionData[] = (data || []).map((session: any) => {
        let title = 'New Plan';
        
        // Use plan title if exists, otherwise keep "New Plan"
        if (session.plans?.title) {
          title = session.plans.title;
          // Truncate long titles
          if (title.length > 30) {
            title = title.substring(0, 30) + '...';
          }
        }
        
        // Format date
        const date = new Date(session.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateStr = '';
        if (date.toDateString() === today.toDateString()) {
          dateStr = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateStr = 'Yesterday';
        } else {
          dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        return {
          id: session.id,
          title,
          date: dateStr,
        };
      });

      setChatSessions(sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  // State for plans with progress
  const [plansWithProgress, setPlansWithProgress] = useState<Array<{id: string; title: string; progress: number}>>([]);

  // Calculate real progress for active plans only
  useEffect(() => {
    const calculateProgress = async () => {
      // Filter only active plans for sidebar
      const activePlans = plans.filter(p => p.status === 'active');
      
      if (activePlans.length === 0) {
        setPlansWithProgress([]);
        return;
      }

      const plansData = await Promise.all(
        activePlans.map(async (plan) => {
          const { data: steps } = await supabase
            .from('steps')
            .select('status')
            .eq('plan_id', plan.id);

          const totalSteps = steps?.length || 0;
          const completedSteps = steps?.filter((s: any) => s.status === 'completed').length || 0;
          const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

          return { id: plan.id, title: plan.title, progress };
        })
      );

      setPlansWithProgress(plansData);
    };

    calculateProgress();
  }, [plans]);

  const handleNewChat = () => {
    if (user) {
      clearChat();
      initializeSession(user.id);
      router.push('/(tabs)/chat');
    }
    setSidebarOpen(false);
  };

  const handleDeleteChat = async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      // Refresh the chat sessions list
      fetchChatSessions();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleStepToggle = async (stepId: string) => {
    const step = upcomingSteps.find(s => s.id === stepId);
    if (!step) return;
    
    const newStatus = step.status === 'completed' ? 'pending' : 'completed';
    await updateStepStatus(stepId, newStatus as 'pending' | 'completed');
    
    if (user) {
      fetchUpcomingSteps(user.id);
    }
  };

  // Mobile: Use bottom tabs (default Expo layout)
  if (isMobile) {
    return <>{children}</>;
  }

  // Tablet: Collapsible sidebar
  if (isTablet) {
    return (
      <View className="flex-1 flex-row bg-white">
        {/* Menu Button */}
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          className="absolute top-4 left-4 z-10 w-10 h-10 rounded-lg bg-[#1a1a1a] items-center justify-center"
          style={{ position: 'absolute' }}
        >
          <Ionicons name="menu" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Sidebar Modal */}
        <Modal
          visible={sidebarOpen}
          animationType="slide"
          transparent
          onRequestClose={() => setSidebarOpen(false)}
        >
          <View className="flex-1 flex-row">
            <View style={{ width: 280 }}>
              <Sidebar
                chatSessions={chatSessions}
                plans={plansWithProgress}
                upcomingSteps={upcomingSteps}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onStepToggle={handleStepToggle}
                onClose={() => setSidebarOpen(false)}
              />
            </View>
            <TouchableOpacity
              className="flex-1 bg-black/50"
              onPress={() => setSidebarOpen(false)}
              activeOpacity={1}
            />
          </View>
        </Modal>

        {/* Main Content */}
        <View className="flex-1">{children}</View>
      </View>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <View className="flex-1 flex-row bg-white">
      {/* Sidebar */}
      <View style={{ width: 260 }}>
        <Sidebar
          chatSessions={chatSessions}
          plans={plansWithProgress}
          upcomingSteps={upcomingSteps}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onStepToggle={handleStepToggle}
        />
      </View>

      {/* Main Content */}
      <View className="flex-1 bg-white">{children}</View>
    </View>
  );
}
