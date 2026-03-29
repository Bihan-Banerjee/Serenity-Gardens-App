import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Theme } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { authAPI } from '../lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      shake();
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      const res = await authAPI.login(email.trim().toLowerCase(), password);
      login(res.data.user, res.data.token);
      router.back();
    } catch (err: any) {
      shake();
      Alert.alert('Login Failed', err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative Header */}
        <LinearGradient
          colors={[Colors.primaryDark, Colors.primary]}
          style={styles.decorBanner}
        >
          <Text style={styles.decorEmoji}>🌿</Text>
          <Text style={styles.decorTitle}>Welcome Back</Text>
          <Text style={styles.decorSub}>Sign in to your garden account</Text>
        </LinearGradient>

        {/* Form */}
        <Animated.View
          style={[
            styles.form,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          <Text style={styles.formLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.formLabel}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Your password"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
            />
            <Pressable
              style={styles.eyeBtn}
              onPress={() => setShowPass((v) => !v)}
            >
              <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
            </Pressable>
          </View>

          <Pressable style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              style={styles.loginGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginBtnText}>Sign In →</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.registerLink}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account?{' '}
              <Text style={styles.registerLinkBold}>Create one →</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },

  decorBanner: {
    paddingTop: 40,
    paddingBottom: 48,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  decorEmoji: { fontSize: 52, marginBottom: 12 },
  decorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
  },
  decorSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },

  form: {
    margin: 20,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    marginTop: -24,
    ...Theme.shadow.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },

  loginBtn: { borderRadius: Theme.borderRadius.full, overflow: 'hidden' },
  loginGradient: { paddingVertical: 15, alignItems: 'center' },
  loginBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.cardBorder },
  dividerText: { fontSize: 13, color: Colors.textMuted },

  registerLink: { alignItems: 'center' },
  registerLinkText: { fontSize: 14, color: Colors.textSecondary },
  registerLinkBold: { color: Colors.primary, fontWeight: '700' },
});
