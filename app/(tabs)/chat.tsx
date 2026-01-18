import React, { useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
  Text,
} from 'react-native';
import { router } from 'expo-router';
import { MessageBubble, ChatInput } from '@/components/chat';
import { useChatStore, useAuthStore, usePlanStore } from '@/lib/stores';
import { updateSessionPlan } from '@/lib/api/chat';
import { flatColors } from '@/theme';
import '../../global.css';

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 768;
  
  const { user } = useAuthStore();
  const {
    messages,
    sessionId,
    isLoading,
    initializeSession,
    sendMessage,
  } = useChatStore();

  const { createPlanFromGenerated } = usePlanStore();

  useEffect(() => {
    if (user && !sessionId) {
      initializeSession(user.id);
    }
  }, [user, sessionId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (user) {
      await sendMessage(message, user.id);
    }
  };

  // Handle question answers from inline MessageBubble
  const handleInlineQuestionAnswer = async (selectedIds: string[]) => {
    if (!user) return;
    
    // Find the selected option labels to send as message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      // Extract question options from the message to get labels
      const jsonMatch = lastMessage.content.match(/\{[\s\S]*"type"\s*:\s*"question"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          const options = parsed.data?.options || [];
          const selectedLabels = selectedIds
            .map(id => options.find((o: any) => o.id === id)?.label)
            .filter(Boolean)
            .join(', ');
          
          if (selectedLabels) {
            await sendMessage(selectedLabels, user.id);
          }
        } catch (e) {
          await sendMessage(selectedIds.join(', '), user.id);
        }
      }
    }
  };

  // Track which plans have been saved (to prevent duplicate saves)
  const [savedPlanIds, setSavedPlanIds] = React.useState<Set<string>>(new Set());

  // Handle plan acceptance from inline MessageBubble
  const handleInlinePlanAccept = async (plan: any) => {
    // Generate a unique ID for this plan based on title
    const planKey = `${plan.title}-${messages.length}`;
    
    // Prevent duplicate saves
    if (savedPlanIds.has(planKey)) {
      return;
    }

    if (user) {
      setSavedPlanIds(prev => new Set([...prev, planKey]));
      const savedPlan = await createPlanFromGenerated(user.id, plan);
      if (savedPlan) {
        // Link the chat session to the plan
        if (sessionId && !sessionId.startsWith('pending_') && !sessionId.startsWith('local_')) {
          try {
            await updateSessionPlan(sessionId, savedPlan.id);
          } catch (error) {
            console.error('Error linking chat to plan:', error);
          }
        }
        router.push(`/plan/${savedPlan.id}`);
      }
    }
  };

  // Check if a plan has already been saved
  const isPlanSaved = (plan: any) => {
    const planKey = `${plan.title}-${messages.length}`;
    return savedPlanIds.has(planKey);
  };

  // Check if there are any messages
  const hasMessages = messages.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-[#0d0d0d]">
      <View className="flex-1">
        {/* Empty State - Show welcome screen when no user messages */}
        {!hasMessages ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-4xl font-semibold text-white text-center mb-8">
              What's your plan?{'\n'}Tell Tino.
            </Text>
            
            {/* Centered Input */}
            <View style={{ width: '100%', maxWidth: 600 }}>
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder="Type your message..."
                variant="dark"
              />
            </View>
          </View>
        ) : (
          <>
            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1"
              contentContainerStyle={{ 
                paddingBottom: 20,
                paddingHorizontal: isDesktop ? 24 : 16,
                paddingTop: 16,
                maxWidth: isDesktop ? 800 : undefined,
                alignSelf: isDesktop ? 'center' : undefined,
                width: '100%',
              }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  content={message.content}
                  role={message.role}
                  isLastMessage={index === messages.length - 1}
                  onQuestionSubmit={handleInlineQuestionAnswer}
                  onPlanAccept={handleInlinePlanAccept}
                  isPlanSaved={savedPlanIds.size > 0 && index === messages.length - 1}
                />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <View className="flex-row items-center py-2">
                  <ActivityIndicator size="small" color={flatColors.primary} />
                </View>
              )}
            </ScrollView>

            {/* Input at bottom */}
            <View style={isDesktop ? { 
              maxWidth: 800, 
              alignSelf: 'center', 
              width: '100%',
              paddingHorizontal: 24,
            } : undefined}>
              <ChatInput
                onSend={handleSendMessage}
                isLoading={isLoading}
                placeholder="Type your message..."
                variant="dark"
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
