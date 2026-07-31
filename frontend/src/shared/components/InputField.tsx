import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@frontend/theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  error?: string;
  editable?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  error,
  editable = true,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          error && styles.inputError,
          !editable && styles.inputDisabled,
        ]}
      >
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          editable={editable}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  multilineContainer: {
    paddingTop: Spacing.md,
  },
  input: {
    ...Typography.body1,
    color: Colors.text,
    padding: 0,
  },
  multilineInput: {
    minHeight: 80,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputDisabled: {
    backgroundColor: Colors.borderLight,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});

