import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  UtensilsCrossed,
  ShoppingBag,
  Receipt,
  Car,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Trash2,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme';
import { Expense } from '@/src/types';
import { getCategoryById } from '@/src/constants/categories';
import { formatCurrency, formatDateShort } from '@/src/utils';

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  UtensilsCrossed,
  ShoppingBag,
  Receipt,
  Car,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
};

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  onDelete?: () => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onPress, onDelete }) => {
  const category = getCategoryById(expense.category);
  const IconComponent = iconMap[category?.icon || 'MoreHorizontal'];
  const iconColor = category?.color || Colors.secondary;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.mainContent}
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <IconComponent size={20} color={iconColor} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.category}>{category?.name || 'Unknown'}</Text>
            <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          </View>
          <Text style={styles.description} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={styles.date}>{formatDateShort(expense.date)}</Text>
        </View>
      </TouchableOpacity>
      {onDelete ? (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete} activeOpacity={0.8}>
          <Trash2 size={18} color={Colors.danger} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
    marginBottom: Spacing.md,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  category: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  amount: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.text,
  },
  description: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  date: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  deleteButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
