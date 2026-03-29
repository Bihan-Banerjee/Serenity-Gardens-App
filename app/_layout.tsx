import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/colors';

// Keep the splash screen visible while we setup
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    // Immediately hide the splash screen since we have no custom fonts to wait for right now
    SplashScreen.hideAsync();
  }, []);

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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: true, title: 'About Us' }} />
        <Stack.Screen name="reviews" options={{ headerShown: true, title: 'Reviews' }} />
        <Stack.Screen name="login" options={{ headerShown: true, title: 'Sign In' }} />
        <Stack.Screen name="register" options={{ headerShown: true, title: 'Create Account' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}