import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { InputField, PrimaryButton } from '@frontend/shared/components';
import { Colors, Typography, Spacing } from '@frontend/theme';
import api from '@frontend/shared/api/client';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/api/auth/forgot-password', {
        email: email.trim(),
      });

      Alert.alert(
        'Success',
        'If an account with that email exists, a password reset link has been sent.'
      );

      router.back();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Unable to process your request.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subtitle}>
          Enter your registered email address and we'll send you a password
          reset link.
        </Text>

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />

        <PrimaryButton
          title="Send Reset Link"
          onPress={handleSend}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.backContainer}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Back to Login
          </Text>
        </TouchableOpacity>
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

  backContainer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },

  backText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});