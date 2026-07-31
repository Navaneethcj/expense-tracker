import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@frontend/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search expenses...',
}) => {
  return (
    <View style={styles.container}>
      <Search size={20} color={Colors.textTertiary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
          <X size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body1,
    color: Colors.text,
    padding: 0,
  },
  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
});

