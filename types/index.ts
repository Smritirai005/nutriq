// types/index.ts

export interface UserData {
  age: string;
  weight: string;
  height: string;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight?: string;
  dailyCalories: number;
}

export interface Ingredient {
  name: string;
  confidence?: number;
}

export interface Recipe {
  id: number;
  title: string;
  image: string;
  usedIngredients?: string[];
  missedIngredients?: string[];
  matchPercentage?: number;
  nutrition: {
    calories: number;
    protein: string | number;
    carbs: string | number;
    fat: string | number;
  };
  readyInMinutes?: number;
  servings?: number;
  ingredients?: RecipeIngredient[];
  instructions?: RecipeStep[];
  summary?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  original: string;
}

export interface RecipeStep {
  number: number;
  step: string;
}

export interface NutritionInfo {
  name: string;
  servingQty: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  image?: string | null;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  servings?: number;
}

export interface ActivityLevel {
  id: string;
  title: string;
  multiplier: number;
}

export interface Goal {
  id: string;
  title: string;
  icon: string;
  deficit: number;
}

export interface FoodItem {
  name: string;
  type: 'common' | 'branded';
  image?: string | null;
  brand?: string;
  nixItemId?: string;
}

export interface APIStatus {
  googleVision: string;
  spoonacular: string;
  nutritionix: string;
  allWorking: boolean;
  error?: string;
}