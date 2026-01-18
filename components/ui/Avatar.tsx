import React from 'react';
import { Image, ImageSourcePropType, Text, View } from 'react-native';

interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded';
}

export function Avatar({
  source,
  name,
  size = 'md',
  variant = 'circle',
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (source) {
    return (
      <Image
        source={source}
        className={`${sizeClasses[size]} ${variantClasses[variant]}`}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      className={`${sizeClasses[size]} ${variantClasses[variant]} bg-primary items-center justify-center`}
    >
      <Text className={`text-white font-bold ${textSizeClasses[size]}`}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
}
