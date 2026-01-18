import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { flatColors } from '@/theme';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  variant?: 'light' | 'dark';
}

export function ChatInput({
  onSend,
  isLoading = false,
  placeholder = 'Type your message...',
  variant = 'light',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width >= 768;

  const isDark = variant === 'dark';

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      onSend(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: any) => {
    if (isWeb && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View 
        className={`${isDesktop ? 'px-0 py-4' : 'px-4 py-3'}`}
        style={{ backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }}
      >
        {/* Modern rounded input container */}
        <View 
          className="flex-row items-end"
          style={{
            backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
            borderRadius: 24,
            borderWidth: 1,
            borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
            paddingLeft: 16,
            paddingRight: 6,
            paddingVertical: 4,
          }}
        >
          {/* Text input */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={isDark ? '#555' : '#999'}
            multiline
            maxLength={1000}
            className="flex-1 py-3"
            style={[
              { 
                color: isDark ? '#fff' : '#333',
                fontSize: 16,
                maxHeight: 120,
              },
              isWeb ? { outlineStyle: 'none' } as any : {},
            ]}
            editable={!isLoading}
            onKeyPress={handleKeyPress}
            returnKeyType="send"
          />

          {/* Send button */}
          <View className="py-2">
            <TouchableOpacity
              onPress={handleSend}
              disabled={!message.trim() || isLoading}
              activeOpacity={0.8}
              className="items-center justify-center w-9 h-9 rounded-full"
              style={{
                backgroundColor: message.trim() && !isLoading 
                  ? flatColors.primary 
                  : isDark ? '#252525' : '#ddd',
              }}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={message.trim() && !isLoading ? '#fff' : isDark ? '#555' : '#999'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
