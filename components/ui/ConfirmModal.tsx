import React from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable 
        className="flex-1 bg-black/50 items-center justify-center p-4"
        onPress={onCancel}
      >
        <Pressable 
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View className="p-6 pb-4">
            <Text className="text-xl font-bold text-text-primary text-center">
              {title}
            </Text>
            <Text className="text-text-secondary text-center mt-2 leading-5">
              {message}
            </Text>
          </View>

          {/* Actions */}
          <View className="flex-row border-t border-border">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 py-4 items-center border-r border-border"
              activeOpacity={0.7}
            >
              <Text className="text-text-secondary font-semibold text-base">
                {cancelText}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 py-4 items-center"
              activeOpacity={0.7}
            >
              <Text 
                className={`font-semibold text-base ${
                  confirmVariant === 'danger' ? 'text-error' : 'text-primary'
                }`}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
