import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme';
import { LucideIcon } from 'lucide-react-native';

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBackgroundColor?: string;
  progress?: number;
  chartData?: number[];
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = Colors.primary,
  iconBackgroundColor = Colors.primaryLight,
  progress,
  chartData,
}) => {
  const normalizedData = chartData && chartData.length > 0 ? chartData : undefined;

  return (
    <LinearGradient
      colors={[iconBackgroundColor, Colors.surface]}
      start={[0, 0]}
      end={[1, 1]}
      style={[styles.container, { borderColor: iconBackgroundColor }]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}> 
          <Icon size={20} color={iconColor} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Live</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>

      {progress !== undefined ? (
        <View style={styles.progressWrap}>
          <View style={styles.progressBarBackground} />
          <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(100, progress))}%`, backgroundColor: iconColor }]} />
        </View>
      ) : null}

      {normalizedData ? (
        <View style={styles.sparkline}>
          {normalizedData.map((n, i) => {
            const max = Math.max(...normalizedData);
            const height = max > 0 ? Math.max(4, (n / max) * 28) : 4;
            return <View key={i} style={[styles.sparkBar, { height }]} />;
          })}
        </View>
      ) : subtitle ? (
        <View style={styles.footer}>
          <View style={styles.dot} />
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      ) : null}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 148,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.h3,
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: Spacing.sm,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textTertiary,
    flex: 1,
  },
  progressWrap: {
    marginTop: Spacing.md,
    height: 14,
    position: 'relative',
  },
  progressBarBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
  },
  progressBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  sparkline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    marginTop: Spacing.md,
  },
  sparkBar: {
    width: 6,
    backgroundColor: Colors.primary,
    marginRight: Spacing.xs,
    borderRadius: 3,
  },
});
