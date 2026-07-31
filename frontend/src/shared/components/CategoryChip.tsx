import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@frontend/theme';

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  color?: string;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected = false,
  onPress,
  color = Colors.primary,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text,
  },
  labelSelected: {
    color: Colors.surface,
  },
});

