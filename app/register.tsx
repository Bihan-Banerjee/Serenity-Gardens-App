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

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
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

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirm.trim()) {
      shake();
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      shake();
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      shake();
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      const res = await authAPI.register(name.trim(), email.trim().toLowerCase(), password);
      login(res.data.user, res.data.token);
      Alert.alert('Welcome! 🌿', `Account created for ${name.trim()}.`, [
        { text: 'Continue', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      shake();
      Alert.alert('Registration Failed', err.message || 'Could not create account.');
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
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Header */}
        <LinearGradient
          colors={[Colors.secondary, Colors.primaryLight, Colors.primary]}
          style={styles.decorBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.decorEmoji}>🌱</Text>
          <Text style={styles.decorTitle}>Join Serenity</Text>
          <Text style={styles.decorSub}>
            Create your account to shop, review & explore
          </Text>

          {/* Perks row */}
          <View style={styles.perksRow}>
            {['🛒 Shop', '📦 Track', '⭐ Review'].map((perk) => (
              <View key={perk} style={styles.perkChip}>
                <Text style={styles.perkText}>{perk}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Form Card */}
        <Animated.View
          style={[
            styles.form,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {/* Name */}
          <Text style={styles.formLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Email */}
          <Text style={styles.formLabel}>Email Address</Text>
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

          {/* Password */}
          <Text style={styles.formLabel}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Min 6 characters"
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

          {/* Confirm Password */}
          <Text style={[styles.formLabel, { marginTop: 16 }]}>
            Confirm Password
          </Text>
          <TextInput
            style={[
              styles.input,
              confirm.length > 0 && confirm !== password && styles.inputError,
            ]}
            placeholder="Repeat your password"
            placeholderTextColor={Colors.textMuted}
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry={!showPass}
            autoCapitalize="none"
          />
          {confirm.length > 0 && confirm !== password && (
            <Text style={styles.errorHint}>Passwords don't match</Text>
          )}

          {/* Password strength indicator */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              {[1, 2, 3, 4].map((level) => {
                const strength = Math.min(Math.floor(password.length / 3), 4);
                const colors = ['#E74C3C', '#E67E22', '#F1C40F', '#27AE60'];
                return (
                  <View
                    key={level}
                    style={[
                      styles.strengthBar,
                      {
                        backgroundColor:
                          level <= strength
                            ? colors[strength - 1]
                            : Colors.cardBorder,
                      },
                    ]}
                  />
                );
              })}
              <Text style={styles.strengthLabel}>
                {password.length < 3
                  ? 'Weak'
                  : password.length < 6
                  ? 'Fair'
                  : password.length < 9
                  ? 'Good'
                  : 'Strong'}
              </Text>
            </View>
          )}

          {/* Submit */}
          <Pressable
            style={styles.registerBtn}
            onPress={handleRegister}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              style={styles.registerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.registerBtnText}>Create Account →</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>already have one?</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            style={styles.loginLink}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginLinkText}>
              Sign in to your account{' '}
              <Text style={styles.loginLinkBold}>→</Text>
            </Text>
          </Pressable>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1 },

  decorBanner: {
    paddingTop: 36,
    paddingBottom: 52,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  decorEmoji: { fontSize: 48, marginBottom: 10 },
  decorTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 6,
  },
  decorSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 18,
  },
  perksRow: {
    flexDirection: 'row',
    gap: 8,
  },
  perkChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Theme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  perkText: { color: Colors.white, fontSize: 12, fontWeight: '600' },

  form: {
    margin: 20,
    backgroundColor: Colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: 24,
    marginTop: -28,
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
  inputError: {
    borderColor: Colors.error,
  },
  errorHint: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
    marginLeft: 4,
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },

  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 20,
    marginTop: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    width: 40,
  },

  registerBtn: { borderRadius: Theme.borderRadius.full, overflow: 'hidden', marginTop: 4 },
  registerGradient: { paddingVertical: 15, alignItems: 'center' },
  registerBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.cardBorder },
  dividerText: { fontSize: 12, color: Colors.textMuted },

  loginLink: { alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: Colors.textSecondary },
  loginLinkBold: { color: Colors.primary, fontWeight: '800' },
});
