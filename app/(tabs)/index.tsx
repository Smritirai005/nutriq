// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/utils/storage';
import { UserData } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await storage.getUserData();
    const calories = await storage.getTodaysCalories();
    setUserData(data);
    setTodayCalories(calories);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calorieProgress = userData 
    ? (todayCalories / userData.dailyCalories) * 100 
    : 0;

  const remainingCalories = userData 
    ? Math.max(0, userData.dailyCalories - todayCalories)
    : 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.greeting}>Hello! 👋</Text>
      <Text style={styles.subGreeting}>Let's reach your fitness goals today</Text>
      
      {userData && (
        <View style={styles.calorieCard}>
          <Text style={styles.calorieTitle}>Today's Calories</Text>
          <Text style={styles.calorieCount}>
            {todayCalories} / {userData.dailyCalories}
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min(calorieProgress, 100)}%`,
                    backgroundColor: calorieProgress > 100 ? '#FF5252' : '#fff'
                  }
                ]} 
              />
            </View>
          </View>
          <Text style={styles.remaining}>
            {calorieProgress > 100 
              ? `${todayCalories - userData.dailyCalories} kcal over limit`
              : `${remainingCalories} kcal remaining`
            }
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => router.push('/(tabs)/camera')}
      >
        <Text style={styles.scanIcon}>📸</Text>
        <Text style={styles.scanText}>Scan Ingredients</Text>
        <Text style={styles.scanSubtext}>Get AI-powered recipe suggestions</Text>
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/tracking')}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Progress</Text>
            <Text style={styles.actionSubtext}>Track your daily nutrition</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Goals</Text>
            <Text style={styles.actionSubtext}>Update your fitness targets</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {userData && (
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>Your Current Goal</Text>
          <Text style={styles.goalValue}>
            {userData.goal === 'lose' ? '📉 Lose Weight' : 
             userData.goal === 'gain' ? '💪 Gain Muscle' : 
             '⚖️ Maintain Weight'}
          </Text>
          <Text style={styles.goalSubtext}>
            {userData.goal === 'lose' 
              ? 'Focus on creating a calorie deficit'
              : userData.goal === 'gain'
              ? 'Prioritize protein and strength training'
              : 'Balance your macros and stay consistent'}
          </Text>
        </View>
      )}

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Daily Tips</Text>
        <Text style={styles.tipText}>• Stay hydrated - drink at least 8 glasses of water</Text>
        <Text style={styles.tipText}>• Plan your meals ahead for better results</Text>
        <Text style={styles.tipText}>• Get 7-9 hours of quality sleep</Text>
        <Text style={styles.tipText}>• Track your meals consistently</Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 20 
  },
  greeting: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginTop: 10, 
    marginBottom: 5,
    color: '#1a1a1a'
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25
  },
  calorieCard: { 
    backgroundColor: '#4CAF50', 
    padding: 25, 
    borderRadius: 20, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  calorieTitle: { 
    color: '#fff', 
    fontSize: 16, 
    marginBottom: 8,
    opacity: 0.9
  },
  calorieCount: { 
    color: '#fff', 
    fontSize: 36, 
    fontWeight: 'bold', 
    marginBottom: 15 
  },
  progressBarContainer: {
    marginBottom: 12
  },
  progressBar: { 
    height: 10, 
    backgroundColor: 'rgba(255,255,255,0.3)', 
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 5,
    transition: 'width 0.3s ease'
  },
  remaining: { 
    color: '#fff', 
    fontSize: 15,
    fontWeight: '600'
  },
  scanButton: {
    backgroundColor: '#2196F3',
    padding: 35,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  scanIcon: { 
    fontSize: 56, 
    marginBottom: 12 
  },
  scanText: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 6 
  },
  scanSubtext: { 
    color: '#E3F2FD', 
    fontSize: 15 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 16,
    color: '#1a1a1a'
  },
  quickActions: { 
    marginBottom: 25 
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8'
  },
  actionIcon: { 
    fontSize: 32, 
    marginRight: 16 
  },
  actionContent: { 
    flex: 1 
  },
  actionTitle: { 
    fontSize: 17, 
    fontWeight: '600', 
    marginBottom: 4,
    color: '#1a1a1a'
  },
  actionSubtext: { 
    fontSize: 14, 
    color: '#666' 
  },
  actionArrow: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300'
  },
  goalCard: {
    backgroundColor: '#E8F5E9',
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9'
  },
  goalTitle: { 
    fontSize: 15, 
    color: '#2E7D32', 
    marginBottom: 10,
    fontWeight: '600'
  },
  goalValue: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1B5E20',
    marginBottom: 8
  },
  goalSubtext: {
    fontSize: 14,
    color: '#388E3C',
    textAlign: 'center',
    lineHeight: 20
  },
  tipsCard: {
    backgroundColor: '#FFF9C4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFF59D'
  },
  tipsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#F57F17'
  },
  tipText: {
    fontSize: 14,
    color: '#F57F17',
    marginBottom: 8,
    lineHeight: 20
  }
});
