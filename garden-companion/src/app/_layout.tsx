import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { GardenProvider, useGarden } from '@/state/garden-store';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { state } = useGarden();

  useEffect(() => {
    if (state.loaded) SplashScreen.hideAsync();
  }, [state.loaded]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add-plant" options={{ presentation: 'modal', title: 'Add a plant' }} />
      <Stack.Screen name="plant/[id]" options={{ title: 'Plant' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GardenProvider>
        <RootStack />
      </GardenProvider>
    </ThemeProvider>
  );
}
