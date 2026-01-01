// app/goal-setup.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/utils/storage';
import { UserData, ActivityLevel, Goal } from '@/types';

const activityLevels: ActivityLevel[] = [
  { id: 'sedentary', title: 'Sedentary (Little/no exercise)', multiplier: 1.2 },
  { id: 'light', title: 'Light Exercise (1-3 days/week)', multiplier: 1.375 },
  { id: 'moderate', title: 'Moderate Exercise (3-5 days/week)', multiplier: 1.55 },
  { id: 'active', title: 'Very Active (6-7 days/week)', multiplier: 1.725 },
];

const goals: Goal[] = [
  { id: 'lose', title: 'Lose Weight', icon: '📉', deficit: -500 },
  { id: 'maintain', title: 'Maintain Weight', icon: '⚖️', deficit: 0 },
  { id: 'gain', title: 'Gain Muscle', icon: '💪', deficit: 300 },
];

export default function GoalSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<Partial<UserData>>({
    age: '',
    weight: '',
    height: '',
    gender: undefined,
    activityLevel: undefined,
    goal: undefined,
    dailyCalories: 0,
  });

  const calculateBMR = (): number => {
    const weight = parseFloat(userData.weight || '0');
    const height = parseFloat(userData.height || '0');
    const age = parseFloat(userData.age || '0');
    
    if (userData.gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = (): number => {
    const bmr = calculateBMR();
    const activity = activityLevels.find(a => a.id === userData.activityLevel);
    return bmr * (activity?.multiplier || 1.2);
  };

  const calculateDailyCalories = (): number => {
    const tdee = calculateTDEE();
    const goal = goals.find(g => g.id === userData.goal);
    return Math.round(tdee + (goal?.deficit || 0));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!userData.age || !userData.weight || !userData.height || !userData.gender) {
        Alert.alert('Missing Info', 'Please fill in all fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!userData.activityLevel) {
        Alert.alert('Missing Info', 'Please select your activity level');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!userData.goal) {
        Alert.alert('Missing Info', 'Please select your goal');
        return;
      }
      
      const calories = calculateDailyCalories();
      const finalData: UserData = {
        ...userData as UserData,
        dailyCalories: calories,
      };
      
      await storage.saveUserData(finalData);
      router.replace('/(tabs)');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Let's Set Your Goals</Text>
      <Text style={styles.subtitle}>Step {step} of 3</Text>

      {step === 1 && (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.optionButton, userData.gender === 'male' && styles.selected]}
              onPress={() => setUserData({...userData, gender: 'male'})}
            >
              <Text style={styles.optionText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, userData.gender === 'female' && styles.selected]}
              onPress={() => setUserData({...userData, gender: 'female'})}
            >
              <Text style={styles.optionText}>Female</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            keyboardType="numeric"
            value={userData.age}
            onChangeText={(text) => setUserData({...userData, age: text})}
          />

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your weight"
            keyboardType="numeric"
            value={userData.weight}
            onChangeText={(text) => setUserData({...userData, weight: text})}
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your height"
            keyboardType="numeric"
            value={userData.height}
            onChangeText={(text) => setUserData({...userData, height: text})}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>Activity Level</Text>
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[styles.card, userData.activityLevel === level.id && styles.selectedCard]}
              onPress={() => setUserData({...userData, activityLevel: level.id as any})}
            >
              <Text style={styles.cardTitle}>{level.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepContainer}>
          <Text style={styles.label}>Your Fitness Goal</Text>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.card, userData.goal === goal.id && styles.selectedCard]}
              onPress={() => setUserData({...userData, goal: goal.id as any})}
            >
              <Text style={styles.icon}>{goal.icon}</Text>
              <Text style={styles.cardTitle}>{goal.title}</Text>
            </TouchableOpacity>
          ))}

          {userData.goal && (
            <View style={styles.calorieBox}>
              <Text style={styles.calorieLabel}>Your Daily Calorie Target:</Text>
              <Text style={styles.calorieValue}>{calculateDailyCalories()} kcal</Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {step === 3 ? 'Get Started' : 'Next'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  stepContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  selected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  calorieBox: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  calorieLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  calorieValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});