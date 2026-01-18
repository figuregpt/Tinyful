import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/lib/stores';
import { flatColors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from 'react-native';
import '../../global.css';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width > 768;
  
  const { signUp, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    const { error: signUpError } = await signUp(email, password);
    
    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View 
          className="flex-1 items-center justify-center px-6"
          style={isDesktop ? { maxWidth: 400, alignSelf: 'center', width: '100%' } : undefined}
        >
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-6">
            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
          </View>
          <Text className="text-xl font-bold text-text-primary text-center mb-2">
            Account Created!
          </Text>
          <Text className="text-text-secondary text-center mb-8 text-sm">
            Please check your email to verify your account, then sign in.
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ 
            flexGrow: 1,
            justifyContent: isDesktop ? 'center' : 'flex-start',
            alignItems: isDesktop ? 'center' : 'stretch',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View 
            className="flex-1 px-6 pt-12 pb-8"
            style={isDesktop ? { 
              maxWidth: 400, 
              width: '100%',
              flex: undefined,
            } : undefined}
          >
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-16 h-16 rounded-full bg-primary items-center justify-center mb-4">
                <Ionicons name="person-add" size={32} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-bold text-text-primary">
                Create Account
              </Text>
              <Text className="text-text-secondary mt-2 text-sm">
                Start achieving your goals today
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4 mb-6">
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon={
                  <Ionicons name="mail-outline" size={18} color={flatColors.textSecondary} />
                }
              />

              <View className="mt-4">
                <Input
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={18} color={flatColors.textSecondary} />
                  }
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={flatColors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              <View className="mt-4">
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  leftIcon={
                    <Ionicons name="lock-closed-outline" size={18} color={flatColors.textSecondary} />
                  }
                />
              </View>
            </View>

            {/* Error */}
            {error ? (
              <View className="bg-error/10 rounded-xl p-3 mb-4">
                <Text className="text-error text-center text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Register Button */}
            <Button
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              size="md"
            />

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-text-secondary text-sm">
                Already have an account?{' '}
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold text-sm">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
