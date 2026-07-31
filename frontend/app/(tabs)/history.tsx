import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Receipt, Calendar, ChevronRight } from 'lucide-react-native';
import { SearchBar, CategoryChip, ExpenseCard, EmptyState } from '@frontend/shared/components';
import { Colors, Typography, Spacing, BorderRadius } from '@frontend/theme';
import { CATEGORIES } from '@frontend/features/expenses/constants/categories';
import { Expense } from '@frontend/shared/types';
import { deleteExpense, getExpenses } from '@frontend/features/expenses/services/expense';
import { sortExpensesByDate, filterByCategory, searchExpenses } from '@frontend/shared/utils';

export default function HistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  const filteredExpenses = React.useMemo(() => {
    let result = expenses;
    result = filterByCategory(result, selectedCategory);
    result = searchExpenses(result, searchQuery);
    return sortExpensesByDate(result);
  }, [expenses, selectedCategory, searchQuery]);

  const handleDeleteExpense = (id: string, description: string) => {
    Alert.alert(
      'Delete Expense',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(id);
            await loadExpenses();
          },
        },
      ]
    );
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <ExpenseCard
      expense={item}
      onEdit={() => router.push({ pathname: '/add-expense', params: { editId: item.id, amount: item.amount.toString(), category: item.category, description: item.description, date: item.date } })}
      onDelete={() => handleDeleteExpense(item.id, item.description)}
    />
  );

  const ListHeaderComponent = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={styles.monthlyHistoryButton}
        onPress={() => router.push('/monthly-history')}
        activeOpacity={0.7}
      >
        <View style={styles.monthlyHistoryLeft}>
          <Calendar size={20} color={Colors.primary} />
          <Text style={styles.monthlyHistoryTitle}>View Monthly History</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <Text style={styles.filterLabel}>Filter by Category</Text>
      <FlatList
        horizontal
        data={[{ id: 'all', name: 'All', icon: 'Filter', color: Colors.primary }, ...CATEGORIES]}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
        renderItem={({ item }) => (
          <CategoryChip
            label={item.name}
            selected={selectedCategory === item.id}
            onPress={() => setSelectedCategory(item.id)}
            color={item.color}
          />
        )}
      />

      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>{filteredExpenses.length} expenses</Text>
      </View>
    </View>
  );

  const ListEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    return (
      <EmptyState
        icon={Receipt}
        title="No expenses found"
        message={
          searchQuery || selectedCategory !== 'all'
            ? 'Try adjusting your filters or search query.'
            : 'Start tracking your expenses by adding your first expense.'
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={styles.title}>Expense History</Text>
        <Text style={styles.subtitle}>View and manage all your expenses</Text>
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderExpenseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + 24,
            maxWidth: isWideScreen ? 960 : '100%',
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  monthlyHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  monthlyHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyHistoryTitle: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  categoriesList: {
    paddingBottom: Spacing.md,
  },
  resultHeader: {
    marginTop: Spacing.md,
  },
  resultCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
});

