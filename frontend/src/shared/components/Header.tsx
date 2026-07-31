import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Typography, Spacing } from '@frontend/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightComponent,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rightSection}>{rightComponent}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    minHeight: 56,
  },
  leftSection: {
    width: 40,
    alignItems: 'flex-start',
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },
  rightSection: {
    width: 40,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.sm,
  },
});

