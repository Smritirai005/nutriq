// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, Meal } from '@/types';

const KEYS = {
  USER_DATA: 'userData',
  HAS_LAUNCHED: 'hasLaunched',
  MEALS_PREFIX: 'meals_',
};

export const storage = {
  // User Data
  async saveUserData(data: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  },

  async getUserData(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },

  // First Launch
  async checkFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem(KEYS.HAS_LAUNCHED);
      if (!hasLaunched) {
        await AsyncStorage.setItem(KEYS.HAS_LAUNCHED, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking first launch:', error);
      return false;
    }
  },

  async resetFirstLaunch(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.HAS_LAUNCHED);
    } catch (error) {
      console.error('Error resetting first launch:', error);
    }
  },

  // Meals
  async saveMealsForDate(date: string, meals: Meal[]): Promise<void> {
    try {
      const key = `${KEYS.MEALS_PREFIX}${date}`;
      await AsyncStorage.setItem(key, JSON.stringify(meals));
    } catch (error) {
      console.error('Error saving meals:', error);
      throw error;
    }
  },

  async getMealsForDate(date: string): Promise<Meal[]> {
    try {
      const key = `${KEYS.MEALS_PREFIX}${date}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting meals:', error);
      return [];
    }
  },

  async addMeal(meal: Meal): Promise<void> {
    try {
      const today = new Date().toDateString();
      const meals = await this.getMealsForDate(today);
      meals.push(meal);
      await this.saveMealsForDate(today, meals);
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  },

  async getTodaysMeals(): Promise<Meal[]> {
    const today = new Date().toDateString();
    return this.getMealsForDate(today);
  },

  async getTodaysCalories(): Promise<number> {
    const meals = await this.getTodaysMeals();
    return meals.reduce((sum, meal) => sum + meal.calories, 0);
  },

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
    }
  },
};