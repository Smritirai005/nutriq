// components/RecipeCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  showMatchPercentage?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onPress,
  showMatchPercentage = true 
}) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {recipe.image && (
        <Image 
          source={{ uri: recipe.image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {recipe.title}
        </Text>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recipe.nutrition.calories}</Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
          
          {recipe.readyInMinutes && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{recipe.readyInMinutes}</Text>
              <Text style={styles.statLabel}>min</Text>
            </View>
          )}
          
          {showMatchPercentage && recipe.matchPercentage && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{recipe.matchPercentage}%</Text>
              <Text style={styles.statLabel}>match</Text>
            </View>
          )}
        </View>

        {recipe.servings && (
          <Text style={styles.servings}>🍽️ {recipe.servings} servings</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { 
    width: 110, 
    height: 110,
    backgroundColor: '#f0f0f0'
  },
  content: { 
    flex: 1, 
    padding: 14,
    justifyContent: 'space-between'
  },
  title: { 
    fontSize: 15, 
    fontWeight: 'bold', 
    marginBottom: 10,
    lineHeight: 20,
    color: '#1a1a1a'
  },
  stats: { 
    flexDirection: 'row', 
    gap: 16,
    marginBottom: 6 
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2
  },
  servings: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  }
});