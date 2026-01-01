// services/integrated.ts
import { googleVisionService } from './googleVision';
import { spoonacularService } from './spoonacular';
import { nutritionixService } from './nutritionix';
import { UserData, Recipe, Ingredient, Meal, APIStatus } from '@/types';

export const integratedService = {
  async analyzeImageAndFindRecipes(
    imageUri: string,
    userGoals: UserData
  ): Promise<{ ingredients: Ingredient[]; recipes: Recipe[]; message: string }> {
    try {
      console.log('🔍 Detecting ingredients...');
      const ingredients = await googleVisionService.detectIngredients(imageUri);
      
      if (ingredients.length === 0) {
        throw new Error('No ingredients detected in image');
      }

      console.log('✅ Found ingredients:', ingredients);

      console.log('🍳 Finding recipes...');
      const recipes = await spoonacularService.findRecipesByIngredients(
        ingredients,
        userGoals
      );

      console.log(`✅ Found ${recipes.length} recipes`);

      return {
        ingredients,
        recipes,
        message: `Found ${ingredients.length} ingredients and ${recipes.length} recipes!`,
      };
    } catch (error: any) {
      console.error('Analysis Error:', error);
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  },

  async getCompleteRecipe(recipeId: number): Promise<Recipe> {
    try {
      console.log('📖 Getting recipe details...');
      const recipe = await spoonacularService.getRecipeDetails(recipeId);
      return recipe;
    } catch (error) {
      console.error('Recipe Details Error:', error);
      throw error;
    }
  },

  async logMealAndTrackCalories(meal: {
    name: string;
    servings: number;
  }): Promise<Meal> {
    try {
      console.log('📊 Tracking meal...');
      
      const nutrition = await nutritionixService.getNutritionInfo(
        meal.name,
        meal.servings
      );

      return {
        name: nutrition.name,
        calories: nutrition.calories * meal.servings,
        protein: nutrition.protein * meal.servings,
        carbs: nutrition.carbs * meal.servings,
        fat: nutrition.fat * meal.servings,
        timestamp: new Date().toISOString(),
        servings: meal.servings,
      };
    } catch (error) {
      console.error('Meal Logging Error:', error);
      throw error;
    }
  },

  async searchFoodItems(query: string) {
    try {
      return await nutritionixService.searchFoods(query);
    } catch (error) {
      console.error('Search Error:', error);
      throw error;
    }
  },

  async quickCalorieLookup(foodName: string, amount: number = 1) {
    try {
      const nutrition = await nutritionixService.getNutritionInfo(foodName, amount);
      
      return {
        name: nutrition.name,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        serving: `${nutrition.servingQty} ${nutrition.servingUnit}`,
      };
    } catch (error) {
      console.error('Lookup Error:', error);
      throw error;
    }
  },

  async analyzeMealDescription(description: string) {
    try {
      return await nutritionixService.analyzeMeal(description);
    } catch (error) {
      console.error('Meal Analysis Error:', error);
      throw error;
    }
  },

  async getPersonalizedRecommendations(preferences: {
    goal: string;
    dailyCalories: number;
  }): Promise<Recipe[]> {
    try {
      const { goal, dailyCalories } = preferences;
      
      const caloriesPerMeal = Math.round(dailyCalories / 3);
      
      let searchQuery = '';
      if (goal === 'lose') {
        searchQuery = 'healthy low calorie';
      } else if (goal === 'gain') {
        searchQuery = 'high protein muscle building';
      } else {
        searchQuery = 'balanced healthy meal';
      }

      const recipes = await spoonacularService.searchRecipes(
        searchQuery,
        caloriesPerMeal + 300
      );
      
      return recipes.slice(0, 10);
    } catch (error) {
      console.error('Recommendations Error:', error);
      throw error;
    }
  },

  async validateAPIs(): Promise<APIStatus> {
    try {
      const [visionStatus, spoonacularStatus, nutritionixStatus] = await Promise.all([
        googleVisionService.testConnection().catch(() => false),
        spoonacularService.testConnection().catch(() => false),
        nutritionixService.testConnection().catch(() => false),
      ]);

      return {
        googleVision: visionStatus ? '✅ Connected' : '❌ Failed',
        spoonacular: spoonacularStatus ? '✅ Connected' : '❌ Failed',
        nutritionix: nutritionixStatus ? '✅ Connected' : '❌ Failed',
        allWorking: visionStatus && spoonacularStatus && nutritionixStatus,
      };
    } catch (error: any) {
      return {
        googleVision: '❌ Failed',
        spoonacular: '❌ Failed',
        nutritionix: '❌ Failed',
        allWorking: false,
        error: error.message,
      };
    }
  },
};