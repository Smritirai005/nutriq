// app/(tabs)/tracking.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal 
} from 'react-native';
import { storage } from '@/utils/storage';
import { integratedService } from '@/services/integrated';
import { UserData, Meal } from '@/types';

export default function TrackingScreen() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [servings, setServings] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const user = await storage.getUserData();
    const todayMeals = await storage.getTodaysMeals();
    setUserData(user);
    setMeals(todayMeals);
  };

  const addMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    setLoading(true);
    try {
      const meal = await integratedService.logMealAndTrackCalories({
        name: mealName,
        servings: parseFloat(servings) || 1,
      });

      await storage.addMeal(meal);
      await loadData();
      
      setShowAddMeal(false);
      setMealName('');
      setServings('1');
      
      Alert.alert('Success', 'Meal logged successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fat, 0);

  const caloriePercentage = userData 
    ? Math.min((totalCalories / userData.dailyCalories) * 100, 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Today's Nutrition</Text>

      {userData && (
        <View style={styles.summaryCard}>
          <View style={styles.mainCalorie}>
            <Text style={styles.mainLabel}>Calories</Text>
            <Text style={styles.mainValue}>
              {totalCalories} / {userData.dailyCalories}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${caloriePercentage}%` }]} 
              />
            </View>
          </View>

          <View style={styles.macros}>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{Math.round(totalProtein)}g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{Math.round(totalCarbs)}g</Text>
            </View>
            <View style={styles.macroItem}>
              <Text style={styles.macroLabel}>Fats</Text>
              <Text style={styles.macroValue}>{Math.round(totalFats)}g</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Meals Today</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddMeal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Meal</Text>
        </TouchableOpacity>
      </View>

      {meals.map((meal, index) => (
        <View key={index} style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <Text style={styles.mealName}>{meal.name}</Text>
            <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
          </View>
          <View style={styles.mealMacros}>
            <Text style={styles.mealMacro}>P: {Math.round(meal.protein)}g</Text>
            <Text style={styles.mealMacro}>C: {Math.round(meal.carbs)}g</Text>
            <Text style={styles.mealMacro}>F: {Math.round(meal.fat)}g</Text>
          </View>
          <Text style={styles.mealTime}>
            {new Date(meal.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      ))}

      {meals.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyText}>No meals logged yet today</Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={() => setShowAddMeal(true)}
          >
            <Text style={styles.emptyButtonText}>Log Your First Meal</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Meal Modal */}
      <Modal
        visible={showAddMeal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMeal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Meal</Text>

            <Text style={styles.inputLabel}>Meal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., grilled chicken breast"
              value={mealName}
              onChangeText={setMealName}
            />

            <Text style={styles.inputLabel}>Servings</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              keyboardType="numeric"
              value={servings}
              onChangeText={setServings}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddMeal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addMeal}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Adding...' : 'Add Meal'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: 10, marginBottom: 20 },
  summaryCard: { 
    backgroundColor: '#f5f5f5', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 20 
  },
  mainCalorie: { alignItems: 'center', marginBottom: 20 },
  mainLabel: { fontSize: 16, color: '#666', marginBottom: 5 },
  mainValue: { fontSize: 36, fontWeight: 'bold', color: '#4CAF50', marginBottom: 10 },
  progressBar: { 
    width: '100%',
    height: 10, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressFill: { height: '100%', backgroundColor: '#4CAF50' },
  macros: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  macroLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  macroValue: { fontSize: 20, fontWeight: 'bold' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 15 
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  addButton: { 
    backgroundColor: '#4CAF50', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  addButtonText: { color: '#fff', fontWeight: '600' },
  mealCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  mealHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 8 
  },
  mealName: { fontSize: 16, fontWeight: '600', flex: 1 },
  mealCalories: { fontSize: 16, color: '#4CAF50', fontWeight: 'bold' },
  mealMacros: { flexDirection: 'row', gap: 15, marginBottom: 5 },
  mealMacro: { fontSize: 13, color: '#666' },
  mealTime: { fontSize: 12, color: '#999' },
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 60,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: 20
  },
  emptyIcon: { fontSize: 60, marginBottom: 15 },
  emptyText: { fontSize: 16, color: '#666', marginBottom: 20 },
  emptyButton: { 
    backgroundColor: '#4CAF50', 
    paddingHorizontal: 30, 
    paddingVertical: 12, 
    borderRadius: 8 
  },
  emptyButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 8, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalButton: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f5f5f5' },
  cancelButtonText: { fontWeight: '600', color: '#666' },
  saveButton: { backgroundColor: '#4CAF50' },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
});