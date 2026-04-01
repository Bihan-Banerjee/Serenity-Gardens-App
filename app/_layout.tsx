import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/colors';
import { useAuthStore } from '../store/useAuthStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    // Restore session from AsyncStorage on every app start
    checkAuth().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  if (isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="about"
          options={{
            headerShown: true,
            title: 'About Us',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: '700', color: Colors.text },
          }}
        />
        <Stack.Screen
          name="reviews"
          options={{
            headerShown: true,
            title: 'Reviews',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: '700', color: Colors.text },
          }}
        />
        <Stack.Screen
          name="login"
          options={{
            headerShown: true,
            title: 'Sign In',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: '700', color: Colors.text },
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            headerShown: true,
            title: 'Create Account',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: '700', color: Colors.text },
          }}
        />
        <Stack.Screen
          name="checkout"
          options={{
            headerShown: true,
            title: 'Checkout',
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontWeight: '700', color: Colors.text },
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
