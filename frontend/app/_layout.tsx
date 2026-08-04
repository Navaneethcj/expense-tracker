import { useEffect, useState } from 'react';
import { Stack, SplashScreen, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@frontend/hooks/useFrameworkReady';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { getStoredToken, getProfile } from '@frontend/features/auth/services/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getStoredToken();
        if (token) {
          await getProfile();
          setAuthenticated(true);
        }
      } catch (error) {
        console.warn('Auth bootstrap failed', error);
      } finally {
        setReady(true);
        if (fontsLoaded || fontError) {
          SplashScreen.hideAsync();
        }
      }
    };

    bootstrap();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (!ready) return;
    if (authenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [ready, authenticated]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen
            name="forgot-password"
            options={{ headerShown: false }}
        />

        <Stack.Screen
            name="reset-password"
            options={{ headerShown: false }}
        />
        <Stack.Screen
          name="add-expense"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-income"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="monthly-history"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}


