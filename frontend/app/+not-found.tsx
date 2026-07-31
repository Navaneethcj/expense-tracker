import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@frontend/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Not Found</Text>
      <Text style={styles.message}>This screen doesn't exist.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  message: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

