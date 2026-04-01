import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator, Alert, LayoutAnimation, UIManager, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function LoginScreen() {
  const router = useRouter();
  const loginAction = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please enter your email and password.');
    }

    try {
      setLoading(true);
      const res = await authAPI.login({ email, password });
      console.log("BACKEND LOGIN RESPONSE:", JSON.stringify(res.data.user, null, 2));
      
      await loginAction(res.data.user, res.data.token);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert(
        'Login Failed',
        err.response?.data?.message || 'Check your credentials and try again.'
      );
    } finally {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🌿</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue to Serenity Gardens</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, { color: Colors.text }]}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <Pressable 
            style={({ pressed }) => [
              styles.loginBtn,
              { 
                opacity: pressed ? 0.8 : 1, 
                transform: [{ scale: pressed ? 0.96 : 1 }] 
              }
            ]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient colors={[Colors.primaryLight, Colors.primaryDark]} style={styles.gradient}>
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/register" asChild>
            <Pressable 
              style={({ pressed }) => [
                { 
                  opacity: pressed ? 0.6 : 1, 
                  transform: [{ scale: pressed ? 0.96 : 1 }] 
                }
              ]} 
            >
              <Text style={styles.link}>Create one</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
  content: { padding: 24, alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginBottom: 32 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: Theme.borderRadius.md, padding: 16, fontSize: 16, marginBottom: 20 },
  loginBtn: { borderRadius: Theme.borderRadius.full, overflow: 'hidden', marginTop: 10 },
  gradient: { paddingVertical: 18, alignItems: 'center' },
  loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', marginTop: 32 },
  footerText: { color: Colors.textSecondary, fontSize: 15 },
  link: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
});