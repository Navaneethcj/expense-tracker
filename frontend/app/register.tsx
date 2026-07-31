import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { InputField, PrimaryButton } from '@frontend/shared/components';
import { Colors, Typography, Spacing } from '@frontend/theme';
import { register, saveToken } from '@frontend/features/auth/services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const nextErrors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email';
    if (!password) nextErrors.password = 'Password is required';
    else if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await register(name.trim(), email.trim(), password);
      await saveToken(response.token);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration failed', error?.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start tracking your incomes and expenses right away.</Text>
        <InputField label="Name" value={name} onChangeText={setName} placeholder="Full name" error={errors.name} />
        <InputField label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" error={errors.email} />
        <InputField label="Password" value={password} onChangeText={setPassword} placeholder="At least 6 characters" error={errors.password} />
        <PrimaryButton title="Register" onPress={handleRegister} loading={loading} />
        <Text style={styles.footerText} onPress={() => router.push('/login')}>
          Already have an account? Login
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

