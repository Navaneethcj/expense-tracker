import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '@frontend/theme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, message }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={48} color={Colors.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});

