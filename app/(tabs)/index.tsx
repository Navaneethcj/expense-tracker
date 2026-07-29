import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Plus, TrendingUp, Calendar, PiggyBank, Wallet, Settings, Receipt, PieChart } from 'lucide-react-native';
import { ScreenContainer, SummaryCard, ExpenseCard, EmptyState } from '@/src/components';
import { Colors, Typography, Spacing, Shadows } from '@/src/theme';
import { Expense, IncomeEntry, CategoryStats } from '@/src/types';
import { getExpenses, getIncomes, deleteExpense } from '@/src/storage';
import {
  getTodayTotal,
  getMonthlyTotal,
  getRecentExpenses,
  formatCurrency,
  getMonthlyIncomes,
  getHighestCategory,
  getMonthlyHistory,
} from '@/src/utils';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [expenseData, incomeData] = await Promise.all([
        getExpenses(),
        getIncomes(),
      ]);
      setExpenses(expenseData);
      setIncomes(incomeData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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

  const todayExpenses = getTodayTotal(expenses);
  const monthlyExpenses = getMonthlyTotal(expenses);
  const monthlyIncome = getMonthlyIncomes(incomes);
  const savings = monthlyIncome - monthlyExpenses;
  const totalTransactions = expenses.length;
  const recentExpenses = getRecentExpenses(expenses, 5);
  const highestCategory: CategoryStats | null = getHighestCategory(expenses);
  const monthlyHistory = getMonthlyHistory(expenses, incomes);

  // Prepare small chart data: last 6 months incomes
  const incomeChartData = monthlyHistory.slice(0, 6).reverse().map((m) => m.totalIncome);

  // Prepare sparkline for last 7 days expenses
  const last7Days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dayTotal = expenses
      .filter((e) => new Date(e.date).toDateString() === d.toDateString())
      .reduce((s, e) => s + e.amount, 0);
    return dayTotal;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Expense Tracker</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScreenContainer
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        <View style={styles.summaryGrid}>
          <View style={[styles.row, isWideScreen && styles.rowWide]}>
            <View style={styles.cardWrapper}>
              <SummaryCard
                title="Monthly Income"
                value={formatCurrency(monthlyIncome)}
                icon={Wallet}
                iconColor={Colors.primary}
                iconBackgroundColor={Colors.primaryLight}
                subtitle="Tap settings to add"
                chartData={incomeChartData}
              />
            </View>
            <View style={styles.cardWrapper}>
              <SummaryCard
                title="This Month"
                value={formatCurrency(monthlyExpenses)}
                icon={Calendar}
                iconColor={Colors.warning}
                iconBackgroundColor={Colors.warningLight}
                progress={monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : undefined}
              />
            </View>
          </View>

          <View style={[styles.row, isWideScreen && styles.rowWide]}>
            <View style={styles.cardWrapper}>
              <SummaryCard
                title="Savings"
                value={formatCurrency(savings)}
                icon={PiggyBank}
                iconColor={savings >= 0 ? Colors.success : Colors.danger}
                iconBackgroundColor={savings >= 0 ? Colors.successLight : Colors.dangerLight}
                subtitle={savings >= 0 ? 'Great job!' : 'Over budget'}
                progress={monthlyIncome > 0 ? Math.round((savings / monthlyIncome) * 100) : undefined}
              />
            </View>
            <View style={styles.cardWrapper}>
              <SummaryCard
                title="Transactions"
                value={totalTransactions.toString()}
                icon={Receipt}
                iconColor={Colors.secondary}
                iconBackgroundColor={Colors.secondaryLight}
                subtitle="All time"
              />
            </View>
          </View>

          <View style={[styles.row, isWideScreen && styles.rowWide]}>
            <View style={styles.cardWrapper}>
              <SummaryCard
                title="Today's Spending"
                value={formatCurrency(todayExpenses)}
                icon={TrendingUp}
                iconColor={Colors.success}
                iconBackgroundColor={Colors.successLight}
                chartData={last7Days}
              />
            </View>
            <View style={styles.cardWrapper}>
              {highestCategory ? (
                <SummaryCard
                  title="Top Category"
                  value={highestCategory.categoryName}
                  icon={PieChart}
                  iconColor={highestCategory.color}
                  iconBackgroundColor={`${highestCategory.color}20`}
                  subtitle={`${formatCurrency(highestCategory.totalAmount)} (${highestCategory.percentage}%)`}
                />
              ) : (
                <SummaryCard
                  title="Top Category"
                  value="N/A"
                  icon={PieChart}
                  iconColor={Colors.textTertiary}
                  iconBackgroundColor={Colors.surfaceSecondary}
                  subtitle="No expenses yet"
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : recentExpenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No expenses yet"
            message="Start tracking your expenses by adding your first expense."
          />
        ) : (
          recentExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={() => router.push({ pathname: '/add-expense', params: { editId: expense.id, amount: expense.amount.toString(), category: expense.category, description: expense.description, date: expense.date } })}
              onDelete={() => handleDeleteExpense(expense.id, expense.description)}
            />
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScreenContainer>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => router.push('/add-expense')}
        activeOpacity={0.8}
      >
        <Plus size={28} color={Colors.surface} />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  summaryGrid: {
    marginBottom: Spacing.xl,
    marginHorizontal: -Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.lg,
    justifyContent: 'space-between',
  },
  rowWide: {
    // preserved for larger layouts
  },
  cardWrapper: {
    flexBasis: '48%',
    maxWidth: '48%',
    minWidth: 140,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxxl,
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
});
