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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isDesktop = isWeb && width > 768;
  
  const { signIn, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    const { error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
    } else {
      router.replace('/(tabs)/chat');
    }
  };

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
                <Ionicons name="flag" size={32} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-bold text-text-primary">
                Welcome Back!
              </Text>
              <Text className="text-text-secondary mt-2 text-sm">
                Sign in to continue your journey
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
                  placeholder="Enter your password"
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
            </View>

            {/* Error */}
            {error ? (
              <View className="bg-error/10 rounded-xl p-3 mb-4">
                <Text className="text-error text-center text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <Button
              title="Sign In"
              onPress={handleLogin}
              isLoading={isLoading}
              size="md"
            />

            {/* Register Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-text-secondary text-sm">
                Don't have an account?{' '}
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold text-sm">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
