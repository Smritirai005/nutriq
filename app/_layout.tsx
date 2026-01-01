// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { storage } from '@/utils/storage';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    const userData = await storage.getUserData();
    
    if (!userData) {
      // First launch or no user data - go to goal setup
      router.replace('/goal-setup');
    } else {
      // User data exists - go to main tabs
      router.replace('/(tabs)');
    }
    
    setIsReady(true);
  };

  if (!isReady) {
    return null; // or a loading screen
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="goal-setup" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name="recipe-details" 
        options={{ 
          title: 'Recipe Details',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}
