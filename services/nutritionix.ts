// services/nutritionix.ts
import { API_KEYS, API_ENDPOINTS } from '@/config/apiKeys';
import { NutritionInfo, FoodItem } from '@/types';

export const nutritionixService = {
  /**
   * Get nutrition information for a food item
   * @param foodName - Name of the food (e.g., "chicken breast")
   * @param quantity - Quantity (default: 1)
   * @returns Nutrition information
   */
  async getNutritionInfo(foodName: string, quantity: number = 1): Promise<NutritionInfo> {
    try {
      const response = await fetch(`${API_ENDPOINTS.NUTRITIONIX}/natural/nutrients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': API_KEYS.NUTRITIONIX_APP_ID,
          'x-app-key': API_KEYS.NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({
          query: `${quantity} ${foodName}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Nutritionix API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        
        return {
          name: food.food_name,
          servingQty: food.serving_qty,
          servingUnit: food.serving_unit,
          calories: Math.round(food.nf_calories),
          protein: Math.round(food.nf_protein),
          carbs: Math.round(food.nf_total_carbohydrate),
          fat: Math.round(food.nf_total_fat),
          fiber: Math.round(food.nf_dietary_fiber || 0),
          sugar: Math.round(food.nf_sugars || 0),
          sodium: Math.round(food.nf_sodium || 0),
          image: food.photo?.thumb || null,
        };
      }

      throw new Error('Food not found');
    } catch (error: any) {
      console.error('Nutritionix API Error:', error);
      throw new Error(`Failed to get nutrition info: ${error.message}`);
    }
  },

  /**
   * Search for food items in the database
   * @param query - Search query
   * @returns Array of food items
   */
  async searchFoods(query: string): Promise<FoodItem[]> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.NUTRITIONIX}/search/instant?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'x-app-id': API_KEYS.NUTRITIONIX_APP_ID,
            'x-app-key': API_KEYS.NUTRITIONIX_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nutritionix API Error: ${response.status}`);
      }

      const data = await response.json();

      // Combine common and branded foods
      const commonFoods: FoodItem[] = (data.common || []).map((food: any) => ({
        name: food.food_name,
        type: 'common' as const,
        image: food.photo?.thumb || null,
      }));

      const brandedFoods: FoodItem[] = (data.branded || [])
        .slice(0, 10)
        .map((food: any) => ({
          name: food.food_name,
          brand: food.brand_name,
          type: 'branded' as const,
          nixItemId: food.nix_item_id,
          image: food.photo?.thumb || null,
        }));

      return [...commonFoods, ...brandedFoods];
    } catch (error: any) {
      console.error('Search Foods Error:', error);
      throw new Error(`Failed to search foods: ${error.message}`);
    }
  },

  /**
   * Get nutrition info for a branded food item
   * @param nixItemId - Nutritionix item ID
   * @returns Nutrition information
   */
  async getBrandedFoodNutrition(nixItemId: string): Promise<NutritionInfo> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.NUTRITIONIX}/search/item?nix_item_id=${nixItemId}`,
        {
          headers: {
            'x-app-id': API_KEYS.NUTRITIONIX_APP_ID,
            'x-app-key': API_KEYS.NUTRITIONIX_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nutritionix API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        
        return {
          name: food.food_name,
          servingQty: food.serving_qty,
          servingUnit: food.serving_unit,
          calories: Math.round(food.nf_calories),
          protein: Math.round(food.nf_protein),
          carbs: Math.round(food.nf_total_carbohydrate),
          fat: Math.round(food.nf_total_fat),
          fiber: Math.round(food.nf_dietary_fiber || 0),
          sugar: Math.round(food.nf_sugars || 0),
          image: food.photo?.thumb || null,
        };
      }

      throw new Error('Food not found');
    } catch (error: any) {
      console.error('Branded Food Error:', error);
      throw new Error(`Failed to get branded food: ${error.message}`);
    }
  },

  /**
   * Analyze a meal description and get nutrition info
   * @param mealDescription - Natural language meal description
   * @returns Combined nutrition for all foods
   */
  async analyzeMeal(mealDescription: string) {
    try {
      const response = await fetch(`${API_ENDPOINTS.NUTRITIONIX}/natural/nutrients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': API_KEYS.NUTRITIONIX_APP_ID,
          'x-app-key': API_KEYS.NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({
          query: mealDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`Nutritionix API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.foods && data.foods.length > 0) {
        // Calculate totals
        const totals = data.foods.reduce(
          (acc: any, food: any) => ({
            calories: acc.calories + food.nf_calories,
            protein: acc.protein + food.nf_protein,
            carbs: acc.carbs + food.nf_total_carbohydrate,
            fat: acc.fat + food.nf_total_fat,
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        return {
          foods: data.foods.map((food: any) => ({
            name: food.food_name,
            quantity: food.serving_qty,
            unit: food.serving_unit,
            calories: Math.round(food.nf_calories),
          })),
          totals: {
            calories: Math.round(totals.calories),
            protein: Math.round(totals.protein),
            carbs: Math.round(totals.carbs),
            fat: Math.round(totals.fat),
          },
        };
      }

      throw new Error('Could not analyze meal');
    } catch (error: any) {
      console.error('Analyze Meal Error:', error);
      throw new Error(`Failed to analyze meal: ${error.message}`);
    }
  },

  /**
   * Get nutrition info from a recipe
   * @param recipe - Recipe object with ingredients
   * @returns Total nutrition information
   */
  async getRecipeNutrition(recipe: { 
    ingredients: Array<{ amount: number; unit: string; name: string }>;
    servings?: number;
  }) {
    try {
      // Combine all ingredients into a query string
      const ingredientQuery = recipe.ingredients
        .map(ing => `${ing.amount} ${ing.unit} ${ing.name}`)
        .join(', ');

      const nutrition = await this.analyzeMeal(ingredientQuery);
      
      // Calculate per serving
      const servings = recipe.servings || 1;
      
      return {
        total: nutrition.totals,
        perServing: {
          calories: Math.round(nutrition.totals.calories / servings),
          protein: Math.round(nutrition.totals.protein / servings),
          carbs: Math.round(nutrition.totals.carbs / servings),
          fat: Math.round(nutrition.totals.fat / servings),
        },
      };
    } catch (error: any) {
      console.error('Recipe Nutrition Error:', error);
      throw new Error(`Failed to calculate recipe nutrition: ${error.message}`);
    }
  },

  /**
   * Test Nutritionix API connection
   * @returns True if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.NUTRITIONIX}/search/instant?query=apple`,
        {
          headers: {
            'x-app-id': API_KEYS.NUTRITIONIX_APP_ID,
            'x-app-key': API_KEYS.NUTRITIONIX_API_KEY,
          },
        }
      );
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return !data.error && (data.common || data.branded);
    } catch (error) {
      console.error('Nutritionix Test Connection Error:', error);
      return false;
    }
  },
};