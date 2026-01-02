import { SymbolView, SymbolWeight } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Platform } from 'react-native';

export interface IconSymbolProps {
  name: string;
  size?: number;
  color?: string;
  weight?: SymbolWeight;
}

// Map SF Symbol names to Ionicons names for Android fallback
const iconMap: Record<string, string> = {
  'house.fill': 'home',
  'chart.bar.fill': 'bar-chart',
  'camera.fill': 'camera',
  'person.fill': 'person',
  'paperplane.fill': 'paper-plane',
};

export function IconSymbol({
  name,
  size = 24,
  color = '#000',
  weight = 'regular',
}: IconSymbolProps) {
  // Use SymbolView on iOS, Ionicons on Android
  if (Platform.OS === 'ios') {
    return (
      <SymbolView
        name={name}
        size={size}
        tintColor={color}
        weight={weight}
        type="hierarchical"
      />
    );
  }

  // Android fallback using Ionicons
  const iconName = iconMap[name] || 'help-circle-outline';
  return <Ionicons name={iconName as any} size={size} color={color} />;
}
