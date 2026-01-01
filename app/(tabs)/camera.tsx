// app/(tabs)/camera.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ActivityIndicator, Alert, ScrollView, RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { storage } from '@/utils/storage';
import { integratedService } from '@/services/integrated';
import { UserData, Recipe, Ingredient } from '@/types';

export default function CameraScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
    requestPermissions();
  }, []);

  const loadUserData = async () => {
    const data = await storage.getUserData();
    setUserData(data);
  };

  const requestPermissions = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    await ImagePicker.requestCameraPermissionsAsync();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to select images'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setError(null);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permissions to take photos'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setError(null);
        analyzeImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const analyzeImage = async (imageUri: string) => {
    if (!userData) {
      Alert.alert(
        'Setup Required',
        'Please complete your fitness goals first',
        [{ text: 'Go to Profile', onPress: () => router.push('/(tabs)/profile') }]
      );
      return;
    }

    setLoading(true);
    setIngredients([]);
    setRecipes([]);
    setError(null);

    try {
      console.log('🚀 Starting image analysis...');
      
      const result = await integratedService.analyzeImageAndFindRecipes(
        imageUri,
        userData
      );

      console.log('✅ Analysis complete');

      setIngredients(result.ingredients);
      setRecipes(result.recipes);

      Alert.alert('Success!', result.message);
    } catch (error: any) {
      console.error('❌ Analysis error:', error);
      
      setError(error.message || 'Failed to analyze image');
      
      Alert.alert(
        'Analysis Failed',
        `Could not analyze image: ${error.message}\n\nTips:\n• Ensure good lighting\n• Keep ingredients clearly visible\n• Try a different angle`,
        [
          { text: 'Try Again', onPress: () => analyzeImage(imageUri) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const viewRecipe = (recipe: Recipe) => {
    router.push({
      pathname: '/recipe-details',
      params: { recipeId: recipe.id.toString() }
    });
  };

  const clearImage = () => {
    setImage(null);
    setIngredients([]);
    setRecipes([]);
    setError(null);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Scan Your Ingredients</Text>
      <Text style={styles.subtitle}>
        Take a photo or upload an image to get personalized recipe suggestions
      </Text>

      {/* Image Display */}
      {!image ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>No image selected</Text>
          <Text style={styles.emptySubtext}>
            Choose an option below to get started
          </Text>
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Analyzing ingredients...</Text>
              <Text style={styles.loadingSubtext}>This may take 10-15 seconds</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
            <Text style={styles.clearButtonText}>✕ Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Detected Ingredients */}
      {ingredients.length > 0 && (
        <View style={styles.ingredientsBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.ingredientsTitle}>
              ✅ Detected Ingredients ({ingredients.length})
            </Text>
          </View>
          <View style={styles.ingredientsList}>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientChip}>
                <Text style={styles.ingredientText}>{ingredient.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recipe Results */}
      {recipes.length > 0 && (
        <View style={styles.recipesSection}>
          <Text style={styles.recipesTitle}>
            🍳 Recipe Suggestions ({recipes.length})
          </Text>
          <Text style={styles.recipesSubtitle}>
            Recipes matched to your fitness goals
          </Text>
          
          {recipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => viewRecipe(recipe)}
            >
              {recipe.image && (
                <Image 
                  source={{ uri: recipe.image }} 
                  style={styles.recipeImage}
                />
              )}
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                
                <View style={styles.recipeStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{recipe.nutrition.calories}</Text>
                    <Text style={styles.statLabel}>kcal</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{recipe.matchPercentage}%</Text>
                    <Text style={styles.statLabel}>match</Text>
                  </View>
                </View>

                {userData && (
                  <View style={styles.goalFit}>
                    {Math.abs(recipe.nutrition.calories - (userData.dailyCalories / 3)) < 200 ? (
                      <Text style={styles.goalFitGood}>✅ Fits your goal</Text>
                    ) : (
                      <Text style={styles.goalFitWarning}>⚠️ High calorie</Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cameraButton]} 
          onPress={takePhoto}
        >
          <Text style={styles.buttonIcon}>📷</Text>
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.galleryButton]} 
          onPress={pickImage}
        >
          <Text style={styles.buttonIcon}>🖼️</Text>
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Tips for Best Results:</Text>
        <Text style={styles.infoText}>• Use good lighting and clear focus</Text>
        <Text style={styles.infoText}>• Keep ingredients visible and uncluttered</Text>
        <Text style={styles.infoText}>• Avoid dark or blurry images</Text>
        <Text style={styles.infoText}>• Fresh, recognizable ingredients work best</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 20, lineHeight: 22 },
  emptyState: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed'
  },
  emptyIcon: { fontSize: 80, marginBottom: 15 },
  emptyText: { fontSize: 18, color: '#666', fontWeight: '600', marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: '#999' },
  imageContainer: { 
    height: 280, 
    marginBottom: 20, 
    borderRadius: 16, 
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000'
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: '#fff', marginTop: 15, fontSize: 17, fontWeight: '600' },
  loadingSubtext: { color: '#ccc', marginTop: 8, fontSize: 13 },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 67, 54, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: { fontSize: 50, marginBottom: 15 },
  errorText: { color: '#fff', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  ingredientsBox: { 
    backgroundColor: '#E8F5E9', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  sectionHeader: { marginBottom: 12 },
  ingredientsTitle: { fontSize: 17, fontWeight: 'bold', color: '#2E7D32' },
  ingredientsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ingredientChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
  },
  ingredientText: { fontSize: 14, color: '#2E7D32', fontWeight: '600' },
  recipesSection: { marginBottom: 20 },
  recipesTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  recipesSubtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  recipeImage: { width: 110, height: 110 },
  recipeInfo: { flex: 1, padding: 14 },
  recipeTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, lineHeight: 20 },
  recipeStats: { flexDirection: 'row', gap: 20, marginBottom: 8 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 11, color: '#666', marginTop: 2 },
  goalFit: { marginTop: 6 },
  goalFitGood: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  goalFitWarning: { fontSize: 12, color: '#FF9800', fontWeight: '600' },
  buttonContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  button: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cameraButton: { backgroundColor: '#4CAF50' },
  galleryButton: { backgroundColor: '#2196F3' },
  buttonIcon: { fontSize: 36, marginBottom: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  infoBox: {
    backgroundColor: '#FFF9C4',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFF59D'
  },
  infoTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 10, color: '#F57F17' },
  infoText: { fontSize: 13, color: '#F57F17', marginBottom: 6, lineHeight: 20 },
});