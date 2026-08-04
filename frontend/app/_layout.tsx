import { useEffect, useState } from 'react';
import { Stack, SplashScreen, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@frontend/hooks/useFrameworkReady';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import {
  getStoredToken,
  getProfile,
} from '@frontend/features/auth/services/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const router = useRouter();
  const segments = useSegments();

  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  // ---------------- BOOTSTRAP ----------------
  useEffect(() => {
    const bootstrap = async () => {
      console.log("========== BOOTSTRAP ==========");

      try {
        const token = await getStoredToken();

        console.log("TOKEN:", token);

        if (token) {
          console.log("Calling getProfile()...");

          const profile = await getProfile();

          console.log("PROFILE:", profile);

          setAuthenticated(true);

          console.log("AUTHENTICATED = TRUE");
        } else {
          console.log("NO TOKEN FOUND");
        }
      } catch (error) {
        console.error("BOOTSTRAP ERROR:", error);
      } finally {
        setReady(true);

        console.log("READY = TRUE");

        if (fontsLoaded || fontError) {
          SplashScreen.hideAsync();
        }
      }
    };

    bootstrap();
  }, [fontsLoaded, fontError]);

  // ---------------- NAVIGATION ----------------
  useEffect(() => {
    console.log("========== NAVIGATION ==========");
    console.log("ready:", ready);
    console.log("authenticated:", authenticated);
    console.log("segments:", segments);

    if (!ready) return;

    const currentRoute = segments[0];

    console.log("currentRoute:", currentRoute);

    const publicRoutes = [
      'login',
      'register',
      'forgot-password',
      'reset-password',
    ];

    if (authenticated) {
      console.log("USER IS AUTHENTICATED");

      if (publicRoutes.includes(currentRoute)) {
        console.log("Redirecting to /(tabs)");
        router.replace('/(tabs)');
      }
    } else {
      console.log("USER IS NOT AUTHENTICATED");

      if (
        !publicRoutes.includes(currentRoute) &&
        currentRoute !== undefined
      ) {
        console.log("Redirecting to /login");
        router.replace('/login');
      }
    }
  }, [ready, authenticated, segments]);

  // ---------------- SPLASH ----------------
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
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="register"
          options={{ headerShown: false }}
        />

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