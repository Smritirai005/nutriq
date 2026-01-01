// services/googleVision.ts
import { API_KEYS, API_ENDPOINTS } from '@/config/apiKeys';
import { Ingredient } from '@/types';

interface VisionResponse {
  responses: Array<{
    labelAnnotations?: Array<{
      description: string;
      score: number;
    }>;
    localizedObjectAnnotations?: Array<{
      name: string;
      score: number;
    }>;
    error?: {
      message: string;
    };
  }>;
}

export const googleVisionService = {
  async detectIngredients(imageUri: string): Promise<Ingredient[]> {
    try {
      // Convert image to base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Call Google Vision API
      const visionResponse = await fetch(
        `${API_ENDPOINTS.GOOGLE_VISION}?key=${API_KEYS.GOOGLE_VISION}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Image,
                },
                features: [
                  {
                    type: 'LABEL_DETECTION',
                    maxResults: 20,
                  },
                  {
                    type: 'OBJECT_LOCALIZATION',
                    maxResults: 20,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data: VisionResponse = await visionResponse.json();

      if (data.responses?.[0]?.error) {
        throw new Error(data.responses[0].error.message);
      }

      if (data.responses && data.responses[0]) {
        const result = data.responses[0];
        
        const labels = result.labelAnnotations || [];
        const objects = result.localizedObjectAnnotations || [];
        
        // Filter for food-related items
        const foodKeywords = [
          'food', 'vegetable', 'fruit', 'meat', 'ingredient',
          'produce', 'cuisine', 'dish', 'plant', 'natural foods'
        ];
        
        const detectedItems = new Set<string>();
        
        // Process labels
        labels.forEach(label => {
          const description = label.description.toLowerCase();
          if (label.score > 0.6 && !foodKeywords.includes(description)) {
            detectedItems.add(this.capitalizeFirst(label.description));
          }
        });
        
        // Process objects
        objects.forEach(obj => {
          if (obj.score > 0.6) {
            detectedItems.add(this.capitalizeFirst(obj.name));
          }
        });
        
        const ingredients = Array.from(detectedItems)
          .slice(0, 10)
          .map(name => ({ name, confidence: 0.8 }));

        if (ingredients.length === 0) {
          throw new Error('No ingredients detected in image');
        }

        return ingredients;
      }

      throw new Error('No response from Google Vision API');
    } catch (error) {
      console.error('Google Vision API Error:', error);
      throw error;
    }
  },

  capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.GOOGLE_VISION}?key=${API_KEYS.GOOGLE_VISION}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { 
                source: { 
                  imageUri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Aspect_ratio_-_16x9.svg/320px-Aspect_ratio_-_16x9.svg.png' 
                }
              },
              features: [{ type: 'LABEL_DETECTION', maxResults: 1 }]
            }]
          })
        }
      );
      const data = await response.json();
      return !data.error;
    } catch (error) {
      return false;
    }
  },
};