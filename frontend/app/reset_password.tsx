import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { InputField, PrimaryButton } from '@frontend/shared/components';
import { Colors, Typography, Spacing } from '@frontend/theme';
import api from '@frontend/shared/api/client';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Error',
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/api/auth/reset-password', {
        token,
        password,
      });

      Alert.alert(
        'Success',
        'Your password has been reset successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          'Unable to reset password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Reset Password</Text>

        <Text style={styles.subtitle}>
          Enter your new password below.
        </Text>

        <InputField
          label="New Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter new password"
          secureTextEntry
        />

        <InputField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry
        />

        <PrimaryButton
          title="Reset Password"
          onPress={handleReset}
          loading={loading}
        />
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
});