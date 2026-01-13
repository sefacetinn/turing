import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: readonly [string, string, ...string[]];
  popular?: boolean;
  onPress: () => void;
}

export function CategoryCard({
  name,
  description,
  icon,
  gradient,
  popular = false,
  onPress,
}: CategoryCardProps) {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {popular && (
          <View style={styles.popularBadge}>
            <Ionicons name="trending-up" size={12} color="rgba(255,255,255,0.7)" />
          </View>
        )}
        <View style={styles.iconBox}>
          <Ionicons name={icon as any} size={20} color="white" />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%',
    marginBottom: 10,
  },
  gradient: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 6,
    minHeight: 120,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  description: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});
