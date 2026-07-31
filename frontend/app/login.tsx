import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { InputField, PrimaryButton } from '@frontend/shared/components';
import { Colors, Typography, Spacing } from '@frontend/theme';
import { login, saveToken } from '@frontend/features/auth/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await login(email.trim(), password);
      await saveToken(response.token);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login failed', error?.response?.data?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue tracking your finances.</Text>
        <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" error={errors.email} />
        <InputField label="Password" value={password} onChangeText={setPassword} placeholder="Enter password" error={errors.password} />
        <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />
        <Text style={styles.footerText} onPress={() => router.push('/register')}>
          Don’t have an account? Register
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body1,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  footerText: {
    marginTop: Spacing.lg,
    textAlign: 'center',
    color: Colors.primary,
    fontWeight: '600',
  },
});

