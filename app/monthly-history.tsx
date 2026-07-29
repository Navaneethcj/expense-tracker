import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, PiggyBank, Receipt, PieChart } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme';
import { Expense, IncomeEntry, CategoryStats } from '@/src/types';
import { getExpenses, getIncomes, deleteExpense } from '@/src/storage';
import { formatCurrency, getMonthlyHistory, formatMonthYear, getMonthlyTotal, getMonthlyIncomes, getHighestCategory, filterExpensesByMonth, filterIncomesByMonth, MonthlySummary } from '@/src/utils';
import { getCategoryById } from '@/src/constants/categories';
import { ExpenseCard } from '@/src/components';

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
  onPress: () => void;
}

const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({ summary, onPress }) => {
  const isPositiveSavings = summary.savings >= 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.monthInfo}>
          <Calendar size={20} color={Colors.primary} />
          <Text style={styles.monthName}>{summary.monthName}</Text>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: Colors.successLight }]}>
            <TrendingUp size={14} color={Colors.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Income</Text>
            <Text style={styles.statValue}>{formatCurrency(summary.totalIncome)}</Text>
          </View>
        </View>

        <View style={styles.stat}>
          <View style={[styles.statIcon, { backgroundColor: Colors.dangerLight }]}>
            <TrendingDown size={14} color={Colors.danger} />
          </View>
          <View>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{formatCurrency(summary.totalExpenses)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.savingsInfo}>
          <PiggyBank size={16} color={isPositiveSavings ? Colors.success : Colors.danger} />
          <Text style={[styles.savingsLabel, { color: isPositiveSavings ? Colors.success : Colors.danger }]}>
            Savings: {formatCurrency(Math.abs(summary.savings))}
          </Text>
          {!isPositiveSavings && <Text style={styles.overBudget}> (Over budget)</Text>}
        </View>
        <View style={styles.transactionInfo}>
          <Receipt size={14} color={Colors.textTertiary} />
          <Text style={styles.transactionCount}>{summary.transactionCount}</Text>
        </View>
      </View>

      {summary.highestCategory && (
        <View style={styles.categoryRow}>
          <View style={[styles.categoryDot, { backgroundColor: summary.highestCategory.color }]} />
          <Text style={styles.categoryText}>
            Top: {summary.highestCategory.categoryName} ({formatCurrency(summary.highestCategory.totalAmount)})
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function MonthlyHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ month?: string; year?: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summaries, setSummaries] = useState<MonthlySummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);

  const loadData = async () => {
    try {
      const [expenseData, incomeData] = await Promise.all([
        getExpenses(),
        getIncomes(),
      ]);
      setExpenses(expenseData);
      setIncomes(incomeData);
      const history = getMonthlyHistory(expenseData, incomeData);
      setSummaries(history);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // If a month is selected, show details
  const isDetailView = selectedMonth !== null && selectedYear !== null;

  const filteredExpenses = isDetailView
    ? filterExpensesByMonth(expenses, selectedMonth, selectedYear)
    : [];

  const filteredIncomes = isDetailView
    ? filterIncomesByMonth(incomes, selectedMonth, selectedYear)
    : [];

  const monthTotal = isDetailView ? getMonthlyTotal(expenses, selectedMonth, selectedYear) : 0;
  const monthIncome = isDetailView ? getMonthlyIncomes(incomes, selectedMonth, selectedYear) : 0;
  const monthSavings = monthIncome - monthTotal;
  const highestCategory = isDetailView ? getHighestCategory(expenses, selectedMonth, selectedYear) : null;

  const handleSelectMonth = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleBack = () => {
    setSelectedMonth(null);
    setSelectedYear(null);
  };

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
            await loadData();
          },
        },
      ]
    );
  };

  const renderMonthCard = ({ item }: { item: MonthlySummary }) => (
    <MonthlySummaryCard
      summary={item}
      onPress={() => handleSelectMonth(item.month, item.year)}
    />
  );

  const ListHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ChevronLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Monthly History</Text>
      <View style={styles.backButton} />
    </View>
  );

  // Detail View
  if (isDetailView) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{formatMonthYear(new Date(selectedYear, selectedMonth))}</Text>
          <View style={styles.backButton} />
        </View>

        <FlatList
          data={filteredExpenses}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListHeaderComponent={
            <View>
              <View style={styles.summaryBox}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Income</Text>
                    <Text style={[styles.summaryValue, { color: Colors.success }]}>{formatCurrency(monthIncome)}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Expenses</Text>
                    <Text style={[styles.summaryValue, { color: Colors.danger }]}>{formatCurrency(monthTotal)}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Savings</Text>
                    <Text style={[styles.summaryValue, { color: monthSavings >= 0 ? Colors.success : Colors.danger }]}>
                      {formatCurrency(monthSavings)}
                    </Text>
                  </View>
                </View>
                {highestCategory && (
                  <View style={styles.highestCategoryBox}>
                    <PieChart size={16} color={highestCategory.color} />
                    <Text style={styles.highestCategoryText}>
                      Top Category: {highestCategory.categoryName} ({formatCurrency(highestCategory.totalAmount)} - {highestCategory.percentage}%)
                    </Text>
                  </View>
                )}
              </View>

              {filteredIncomes.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Income Entries ({filteredIncomes.length})</Text>
                  {filteredIncomes.map((income) => (
                    <View key={income.id} style={styles.incomeItem}>
                      <View style={styles.incomeIcon}>
                        <TrendingUp size={16} color={Colors.success} />
                      </View>
                      <View style={styles.incomeContent}>
                        <Text style={styles.incomeDescription}>{income.description}</Text>
                        <Text style={styles.incomeDate}>{new Date(income.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
                      </View>
                      <Text style={styles.incomeAmount}>{formatCurrency(income.amount)}</Text>
                    </View>
                  ))}
                </>
              )}

              <Text style={styles.sectionTitle}>Expenses ({filteredExpenses.length})</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Receipt size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No expenses this month</Text>
            </View>
          }
          renderItem={({ item }) => (
            <ExpenseCard
              expense={item}
              onEdit={() => router.push({ pathname: '/add-expense', params: { editId: item.id, amount: item.amount.toString(), category: item.category, description: item.description, date: item.date } })}
              onDelete={() => handleDeleteExpense(item.id, item.description)}
            />
          )}
        />
      </View>
    );
  }

  // Month List View
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly History</Text>
        <View style={styles.backButton} />
      </View>

      <FlatList
        data={summaries}
        keyExtractor={(item) => `${item.year}-${item.month}`}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Calendar size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No history yet</Text>
              <Text style={styles.emptySubtext}>Add expenses to see monthly summaries</Text>
            </View>
          )
        }
        renderItem={renderMonthCard}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Spacing.sm,
    width: 40,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  listContent: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  monthInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthName: {
    ...Typography.h4,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  statValue: {
    ...Typography.body1,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsLabel: {
    ...Typography.body2,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  overBudget: {
    ...Typography.caption,
    color: Colors.danger,
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionCount: {
    ...Typography.body2,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
  },
  emptyText: {
    ...Typography.body1,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    ...Typography.body2,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  // Detail view styles
  summaryBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryValue: {
    ...Typography.h4,
    fontWeight: '700',
  },
  highestCategoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  highestCategoryText: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  incomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  incomeIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  incomeContent: {
    flex: 1,
  },
  incomeDescription: {
    ...Typography.body2,
    fontWeight: '500',
    color: Colors.text,
  },
  incomeDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  incomeAmount: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.success,
  },
});
