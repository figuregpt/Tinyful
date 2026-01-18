import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Question, QuestionOption } from '@/lib/eliza';

interface QuestionCardProps {
  question: Question;
  onSubmit: (selectedIds: string[]) => void;
  isLoading?: boolean;
  hidePrompt?: boolean;
}

export function QuestionCard({ question, onSubmit, isLoading, hidePrompt }: QuestionCardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleOptionPress = (optionId: string) => {
    if (question.allowMultiple) {
      setSelectedIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedIds([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length > 0) {
      onSubmit(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <View 
      className="mx-4 my-2 rounded-2xl p-4"
      style={{ backgroundColor: '#1a1a1a' }}
    >
      {!hidePrompt && (
        <Text className="text-lg font-bold mb-4" style={{ color: '#ffffff' }}>
          {question.prompt}
        </Text>
      )}

      <View className="space-y-2 mb-4">
        {question.options.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selectedIds.includes(option.id)}
            onPress={() => handleOptionPress(option.id)}
          />
        ))}
      </View>

      <Button
        title="Continue"
        onPress={handleSubmit}
        disabled={selectedIds.length === 0}
        isLoading={isLoading}
      />

      {question.allowMultiple && (
        <Text className="text-sm text-center mt-2" style={{ color: '#888' }}>
          You can select multiple options
        </Text>
      )}
    </View>
  );
}

interface OptionButtonProps {
  option: QuestionOption;
  isSelected: boolean;
  onPress: () => void;
}

function OptionButton({ option, isSelected, onPress }: OptionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="p-4 rounded-xl mb-2"
      style={{
        backgroundColor: isSelected ? 'rgba(76, 175, 80, 0.15)' : '#252525',
        borderWidth: 2,
        borderColor: isSelected ? '#4CAF50' : '#333',
      }}
    >
      <View className="flex-row items-center">
        <View
          className="w-6 h-6 rounded-full mr-3 items-center justify-center"
          style={{
            borderWidth: 2,
            borderColor: isSelected ? '#4CAF50' : '#444',
            backgroundColor: isSelected ? '#4CAF50' : 'transparent',
          }}
        >
          {isSelected && (
            <View className="w-3 h-3 rounded-full bg-white" />
          )}
        </View>
        
        <View className="flex-1">
          <Text
            className="text-base font-semibold"
            style={{ color: isSelected ? '#4CAF50' : '#ffffff' }}
          >
            {option.label}
          </Text>
          
          {option.description && (
            <Text className="text-sm mt-0.5" style={{ color: '#888' }}>
              {option.description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
