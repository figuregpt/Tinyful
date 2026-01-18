import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { flatColors } from '@/theme';
import '../global.css';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-white px-8">
        <View className="w-24 h-24 rounded-full bg-warning/20 items-center justify-center mb-6">
          <Ionicons name="alert-circle" size={48} color={flatColors.warning} />
        </View>
        
        <Text className="text-2xl font-bold text-text-primary text-center mb-2">
          Page Not Found
        </Text>
        
        <Text className="text-text-secondary text-center mb-8">
          The page you're looking for doesn't exist or has been moved.
        </Text>

        <Link href="/(tabs)/chat" asChild>
          <Button title="Go to Home" size="lg" />
        </Link>
      </View>
    </>
  );
}
