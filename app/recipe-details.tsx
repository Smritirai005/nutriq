// app/recipe-details.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image, 
  ActivityIndicator, TouchableOpacity, Alert 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { integratedService } from '@/services/integrated';
import { storage } from '@/utils/storage';
import { Recipe } from '@/types';

export default function RecipeDetailsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const recipeId = parseInt(params.recipeId as string);
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, []);

  const loadRecipe = async () => {
    try {
      const details = await integratedService.getCompleteRecipe(recipeId);
      setRecipe(details);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to load recipe details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async () => {
    if (!recipe) return;

    Alert.alert(
      'Log Meal',
      `Log "${recipe.title}" to your daily tracking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log',
          onPress: async () => {
            try {
              const meal = await integratedService.logMealAndTrackCalories({
                name: recipe.title,
                servings: 1,
              });
              
              await storage.addMeal(meal);
              Alert.alert('Success', 'Meal logged successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.loading}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {recipe.image && (
        <Image source={{ uri: recipe.image }} style={styles.image} />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        
        <View style={styles.metaRow}>
          {recipe.readyInMinutes && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{recipe.readyInMinutes} min</Text>
            </View>
          )}
          {recipe.servings && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>🍽️</Text>
              <Text style={styles.metaText}>{recipe.servings} servings</Text>
            </View>
          )}
        </View>

        {/* Nutrition */}
        <View style={styles.nutrition}>
          <Text style={styles.sectionTitle}>Nutrition per serving</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {typeof recipe.nutrition.calories === 'number' 
                  ? recipe.nutrition.calories 
                  : parseInt(recipe.nutrition.calories.toString()) || 0}
              </Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {typeof recipe.nutrition.protein === 'number'
                  ? `${recipe.nutrition.protein}g`
                  : recipe.nutrition.protein}
              </Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {typeof recipe.nutrition.carbs === 'number'
                  ? `${recipe.nutrition.carbs}g`
                  : recipe.nutrition.carbs}
              </Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {typeof recipe.nutrition.fat === 'number'
                  ? `${recipe.nutrition.fat}g`
                  : recipe.nutrition.fat}
              </Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        {recipe.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.summaryText}>{recipe.summary}</Text>
          </View>
        )}

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.ingredient}>
                  {ing.original || `${ing.amount} ${ing.unit} ${ing.name}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        {recipe.instructions && recipe.instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <Text style={styles.stepText}>{step.step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Log Meal Button */}
        <TouchableOpacity style={styles.logButton} onPress={logMeal}>
          <Text style={styles.logButtonText}>📊 Log This Meal</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loading: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff' 
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  image: { width: '100%', height: 300, backgroundColor: '#f0f0f0' },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 15, lineHeight: 32 },
  metaRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaIcon: { fontSize: 18, marginRight: 5 },
  metaText: { fontSize: 15, color: '#666' },
  nutrition: { 
    backgroundColor: '#E8F5E9', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 25 
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  nutritionGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    marginTop: 10 
  },
  nutritionItem: { alignItems: 'center' },
  nutritionValue: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2E7D32',
    marginBottom: 5 
  },
  nutritionLabel: { fontSize: 13, color: '#1B5E20' },
  section: { marginBottom: 25 },
  summaryText: { fontSize: 15, lineHeight: 24, color: '#555' },
  ingredientItem: { 
    flexDirection: 'row', 
    marginBottom: 10,
    paddingLeft: 5
  },
  bullet: { fontSize: 16, marginRight: 10, color: '#4CAF50', fontWeight: 'bold' },
  ingredient: { flex: 1, fontSize: 15, lineHeight: 22, color: '#333' },
  step: { flexDirection: 'row', marginBottom: 20 },
  stepNumber: { 
    width: 32, 
    height: 32, 
    backgroundColor: '#4CAF50', 
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2
  },
  stepNumberText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16
  },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22, color: '#333' },
  logButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  logButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});