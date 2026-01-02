// services/spoonacular.ts
import { API_KEYS, API_ENDPOINTS } from '@/config/apiKeys';
import { Recipe, UserData, Ingredient } from '@/types';

export const spoonacularService = {
  /**
   * Find recipes based on ingredients and dietary goals
   * @param ingredients - Array of ingredient names
   * @param userGoals - User's fitness goals and calorie target
   * @returns Array of recipe objects
   */
  async findRecipesByIngredients(
    ingredients: Ingredient[],
    userGoals: UserData
  ): Promise<Recipe[]> {
    try {
      const ingredientString = ingredients.map(i => i.name).join(',+');
      
      // Determine diet type based on goal
      let diet = '';
      if (userGoals.goal === 'lose') {
        diet = 'low-calorie';
      } else if (userGoals.goal === 'gain') {
        diet = 'high-protein';
      }

      const params = new URLSearchParams({
        apiKey: API_KEYS.SPOONACULAR,
        ingredients: ingredientString,
        number: '10',
        ranking: '2', // Maximize used ingredients
        ignorePantry: 'false',
        limitLicense: 'false',
      });

      if (diet) {
        params.append('diet', diet);
      }

      const response = await fetch(
        `${API_ENDPOINTS.SPOONACULAR}/recipes/findByIngredients?${params}`
      );

      if (!response.ok) {
        throw new Error(`Spoonacular API Error: ${response.status}`);
      }

      const recipes = await response.json();

      // Get detailed nutrition info for top 5 recipes
      const recipesWithNutrition = await Promise.all(
        recipes.slice(0, 5).map(async (recipe: any) => {
          try {
            const nutrition = await this.getRecipeNutrition(recipe.id);
            return {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              usedIngredients: recipe.usedIngredients?.map((i: any) => i.name) || [],
              missedIngredients: recipe.missedIngredients?.map((i: any) => i.name) || [],
              nutrition: nutrition,
              matchPercentage: Math.round(
                (recipe.usedIngredientCount / 
                (recipe.usedIngredientCount + recipe.missedIngredientCount)) * 100
              ),
            };
          } catch (error) {
            console.error(`Failed to get nutrition for recipe ${recipe.id}:`, error);
            return {
              id: recipe.id,
              title: recipe.title,
              image: recipe.image,
              usedIngredients: recipe.usedIngredients?.map((i: any) => i.name) || [],
              missedIngredients: recipe.missedIngredients?.map((i: any) => i.name) || [],
              nutrition: { calories: 0, protein: '0g', carbs: '0g', fat: '0g' },
              matchPercentage: 0,
            };
          }
        })
      );

      // Filter recipes based on calorie target (±300 calories)
      const targetCalories = userGoals.dailyCalories / 3; // Assuming 3 meals/day
      
      const filteredRecipes = recipesWithNutrition.filter(recipe => {
        const calories = recipe.nutrition.calories;
        return calories >= (targetCalories - 300) && calories <= (targetCalories + 300);
      });

      // Return filtered recipes if any match, otherwise return all
      return filteredRecipes.length > 0 ? filteredRecipes : recipesWithNutrition;
    } catch (error: any) {
      console.error('Spoonacular API Error:', error);
      throw new Error(`Failed to find recipes: ${error.message}`);
    }
  },

  /**
   * Get detailed nutrition information for a recipe
   * @param recipeId - Spoonacular recipe ID
   * @returns Nutrition information
   */
  async getRecipeNutrition(recipeId: number): Promise<Recipe['nutrition']> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SPOONACULAR}/recipes/${recipeId}/nutritionWidget.json?apiKey=${API_KEYS.SPOONACULAR}`
      );

      if (!response.ok) {
        throw new Error(`Spoonacular API Error: ${response.status}`);
      }

      const data = await response.json();

      return {
        calories: parseInt(data.calories) || 0,
        protein: data.protein || '0g',
        carbs: data.carbs || '0g',
        fat: data.fat || '0g',
      };
    } catch (error: any) {
      console.error('Nutrition API Error:', error);
      return {
        calories: 0,
        protein: '0g',
        carbs: '0g',
        fat: '0g',
      };
    }
  },

  /**
   * Get full recipe details including instructions
   * @param recipeId - Spoonacular recipe ID
   * @returns Detailed recipe information
   */
  async getRecipeDetails(recipeId: number): Promise<Recipe> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SPOONACULAR}/recipes/${recipeId}/information?apiKey=${API_KEYS.SPOONACULAR}&includeNutrition=true`
      );

      if (!response.ok) {
        throw new Error(`Spoonacular API Error: ${response.status}`);
      }

      const recipe = await response.json();

      return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        summary: recipe.summary?.replace(/<[^>]*>/g, ''), // Remove HTML tags
        ingredients: recipe.extendedIngredients?.map((ing: any) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          original: ing.original,
        })) || [],
        instructions: recipe.analyzedInstructions?.[0]?.steps?.map((step: any) => ({
          number: step.number,
          step: step.step,
        })) || [],
        nutrition: {
          calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
          protein: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
          carbs: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
          fat: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
        },
      };
    } catch (error: any) {
      console.error('Recipe Details Error:', error);
      throw new Error(`Failed to get recipe details: ${error.message}`);
    }
  },

  /**
   * Search recipes by name or keywords
   * @param query - Search query
   * @param maxCalories - Maximum calories per serving (optional)
   * @returns Array of recipes
   */
  async searchRecipes(query: string, maxCalories?: number): Promise<Recipe[]> {
    try {
      const params = new URLSearchParams({
        apiKey: API_KEYS.SPOONACULAR,
        query: query,
        number: '10',
        addRecipeInformation: 'true',
        fillIngredients: 'true',
      });

      if (maxCalories) {
        params.append('maxCalories', maxCalories.toString());
      }

      const response = await fetch(
        `${API_ENDPOINTS.SPOONACULAR}/recipes/complexSearch?${params}`
      );

      if (!response.ok) {
        throw new Error(`Spoonacular API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Map results to Recipe type
      return (data.results || []).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        nutrition: {
          calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
          protein: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
          carbs: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
          fat: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
        },
      }));
    } catch (error: any) {
      console.error('Search Recipes Error:', error);
      throw new Error(`Failed to search recipes: ${error.message}`);
    }
  },

  /**
   * Get random recipes
   * @param number - Number of recipes to get
   * @param tags - Optional tags (e.g., 'vegetarian', 'dessert')
   * @returns Array of random recipes
   */
  async getRandomRecipes(number: number = 5, tags?: string): Promise<Recipe[]> {
    try {
      const params = new URLSearchParams({
        apiKey: API_KEYS.SPOONACULAR,
        number: number.toString(),
      });

      if (tags) {
        params.append('tags', tags);
      }

      const response = await fetch(
        `${API_ENDPOINTS.SPOONACULAR}/recipes/random?${params}`
      );

      if (!response.ok) {
        throw new Error(`Spoonacular API Error: ${response.status}`);
      }

      const data = await response.json();
      
      return (data.recipes || []).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        summary: recipe.summary?.replace(/<[^>]*>/g, ''),
        nutrition: {
          calories: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Calories')?.amount || 0,
          protein: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Protein')?.amount || 0,
          carbs: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Carbohydrates')?.amount || 0,
          fat: recipe.nutrition?.nutrients?.find((n: any) => n.name === 'Fat')?.amount || 0,
        },
      }));
    } catch (error: any) {
      console.error('Random Recipes Error:', error);
      throw new Error(`Failed to get random recipes: ${error.message}`);
    }
  },

  /**
   * Test Spoonacular API connection
   * @returns True if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SPOONACULAR}/recipes/random?apiKey=${API_KEYS.SPOONACULAR}&number=1`
      );
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      return !data.error && data.recipes?.length > 0;
    } catch (error) {
      console.error('Spoonacular Test Connection Error:', error);
      return false;
    }
  },
};