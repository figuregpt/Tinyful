import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Avatar } from '../ui/Avatar';
import { QuestionCard } from './QuestionCard';
import { PlanPreviewCard } from './PlanPreviewCard';
import { Question } from '@/lib/eliza';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  onQuestionSubmit?: (selectedIds: string[]) => void;
  onPlanAccept?: (plan: any) => void;
  isLastMessage?: boolean;
  isPlanSaved?: boolean;
}

// Parse JSON from message content
function parseStructuredContent(content: string): {
  textBefore: string;
  structuredData: { type: string; data: any } | null;
  textAfter: string;
} {
  // Look for JSON in the content
  const jsonMatch = content.match(/\{[\s\S]*"type"\s*:\s*"(question|plan)"[\s\S]*\}/);
  
  if (!jsonMatch) {
    return { textBefore: content, structuredData: null, textAfter: '' };
  }

  try {
    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);
    
    if (parsed.type === 'question' || parsed.type === 'plan') {
      const startIndex = content.indexOf(jsonStr);
      const textBefore = content.substring(0, startIndex).trim();
      const textAfter = content.substring(startIndex + jsonStr.length).trim();
      
      return { textBefore, structuredData: parsed, textAfter };
    }
  } catch (e) {
    // JSON parse failed, return as plain text
  }

  return { textBefore: content, structuredData: null, textAfter: '' };
}

export function MessageBubble({ 
  content, 
  role, 
  timestamp, 
  onQuestionSubmit,
  onPlanAccept,
  isLastMessage,
  isPlanSaved 
}: MessageBubbleProps) {
  const isUser = role === 'user';

  // Parse content for structured data (questions/plans)
  const { textBefore, structuredData, textAfter } = useMemo(
    () => parseStructuredContent(content),
    [content]
  );

  // Convert structured data to Question format
  const question: Question | null = useMemo(() => {
    if (structuredData?.type === 'question' && structuredData.data) {
      return {
        id: structuredData.data.id,
        prompt: structuredData.data.prompt,
        options: structuredData.data.options || [],
        allowMultiple: structuredData.data.allowMultiple || false,
      };
    }
    return null;
  }, [structuredData]);

  const plan = useMemo(() => {
    if (structuredData?.type === 'plan' && structuredData.data) {
      return structuredData.data;
    }
    return null;
  }, [structuredData]);

  // Display text: textBefore, or question prompt if this is a question message
  const displayText = textBefore || question?.prompt || '';

  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="mr-2">
            <Avatar name="Tino" size="sm" />
          </View>
        )}
        
        <View className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Text content - always show question prompt as message */}
          {displayText && (
            <View
              className="rounded-2xl px-4 py-3"
              style={{
                backgroundColor: isUser ? '#4CAF50' : '#1e1e1e',
                borderBottomRightRadius: isUser ? 6 : 16,
                borderBottomLeftRadius: isUser ? 16 : 6,
              }}
            >
              <Text
                className="text-base"
                style={{ color: '#ffffff' }}
              >
                {displayText}
              </Text>
            </View>
          )}
          
          {timestamp && (
            <Text className="text-text-secondary text-xs mt-1">
              {timestamp}
            </Text>
          )}
        </View>

        {isUser && (
          <View className="ml-2">
            <Avatar name="You" size="sm" />
          </View>
        )}
      </View>

      {/* Question Card - only show options on last message */}
      {question && isLastMessage && onQuestionSubmit && (
        <View className="w-full mt-3">
          <QuestionCard
            question={question}
            onSubmit={onQuestionSubmit}
            hidePrompt={true}
          />
        </View>
      )}

      {/* Plan Preview Card */}
      {plan && isLastMessage && onPlanAccept && !isPlanSaved && (
        <View className="w-full mt-3">
          <PlanPreviewCard
            plan={plan}
            onSave={() => onPlanAccept(plan)}
            onDiscard={() => {}}
          />
        </View>
      )}

      {/* Plan Saved Message */}
      {plan && isPlanSaved && (
        <View className="w-full mt-3 mx-4 p-4 bg-success/10 rounded-xl border border-success/20">
          <View className="flex-row items-center">
            <Text className="text-success text-lg mr-2">✓</Text>
            <Text className="text-success font-semibold">Plan saved! Redirecting...</Text>
          </View>
        </View>
      )}

      {/* Text after structured content (if any) */}
      {textAfter && !isUser && (
        <View className="flex-row mt-2">
          <View className="w-8 mr-2" />
          <View
            className="rounded-2xl px-4 py-3 max-w-[80%]"
            style={{
              backgroundColor: '#1e1e1e',
              borderBottomLeftRadius: 6,
            }}
          >
            <Text className="text-base" style={{ color: '#ffffff' }}>
              {textAfter}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
