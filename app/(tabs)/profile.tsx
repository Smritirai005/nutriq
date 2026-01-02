// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/utils/storage';
import { UserData } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await storage.getUserData();
    setUserData(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEditGoals = () => {
    router.push('/goal-setup');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all your data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            router.replace('/goal-setup');
          },
        },
      ]
    );
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.title}>Profile</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>No profile data found</Text>
            <TouchableOpacity 
              style={styles.setupButton}
              onPress={() => router.push('/goal-setup')}
            >
              <Text style={styles.setupButtonText}>Set Up Your Profile</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const goalText = userData.goal === 'lose' 
    ? 'Lose Weight' 
    : userData.goal === 'gain' 
    ? 'Gain Muscle' 
    : 'Maintain Weight';

  const goalIcon = userData.goal === 'lose' 
    ? '📉' 
    : userData.goal === 'gain' 
    ? '💪' 
    : '⚖️';

  const activityText = userData.activityLevel === 'sedentary'
    ? 'Sedentary'
    : userData.activityLevel === 'light'
    ? 'Light Exercise'
    : userData.activityLevel === 'moderate'
    ? 'Moderate Exercise'
    : 'Very Active';

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.profileName}>Your Profile</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>
              {userData.gender === 'male' ? 'Male' : 'Female'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Age</Text>
            <Text style={styles.infoValue}>{userData.age} years</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Weight</Text>
            <Text style={styles.infoValue}>{userData.weight} kg</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Height</Text>
            <Text style={styles.infoValue}>{userData.height} cm</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
          
          <View style={styles.goalCard}>
            <Text style={styles.goalIcon}>{goalIcon}</Text>
            <View style={styles.goalContent}>
              <Text style={styles.goalTitle}>{goalText}</Text>
              <Text style={styles.goalSubtext}>Current fitness goal</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activity Level</Text>
            <Text style={styles.infoValue}>{activityText}</Text>
          </View>

          <View style={styles.calorieCard}>
            <Text style={styles.calorieLabel}>Daily Calorie Target</Text>
            <Text style={styles.calorieValue}>{userData.dailyCalories} kcal</Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEditGoals}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionText}>Edit Goals</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={handleClearData}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
            <Text style={[styles.actionText, styles.dangerText]}>Clear All Data</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    color: '#1a1a1a',
  },
  profileCard: {
    backgroundColor: '#4CAF50',
    padding: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    fontSize: 40,
  },
  profileName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1a1a1a',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  goalIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  goalSubtext: {
    fontSize: 14,
    color: '#388E3C',
  },
  calorieCard: {
    backgroundColor: '#2196F3',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  calorieLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
  },
  calorieValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  dangerButton: {
    borderColor: '#ffcdd2',
    backgroundColor: '#ffebee',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  dangerText: {
    color: '#c62828',
  },
  actionArrow: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  setupButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
