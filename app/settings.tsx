import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Wallet, Calendar, Pencil } from 'lucide-react-native';
import { PrimaryButton } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/src/theme';
import { IncomeEntry } from '@/src/types';
import { getIncomes, deleteIncome } from '@/src/storage';
import { formatCurrency, formatDateShort, getMonthlyIncomes } from '@/src/utils';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWideScreen = width >= 768;
  const [incomes, setIncomes] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadIncomes = async () => {
    try {
      const data = await getIncomes();
      setIncomes(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error loading incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadIncomes();
    }, [])
  );

  const monthlyIncome = getMonthlyIncomes(incomes);

  const handleDelete = (id: string, description: string) => {
    Alert.alert(
      'Delete Income',
      `Are you sure you want to delete "${description}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteIncome(id);
            loadIncomes();
          },
        },
      ]
    );
  };

  const renderIncomeItem = ({ item }: { item: IncomeEntry }) => (
    <View style={styles.incomeCard}>
      <View style={styles.incomeIcon}>
        <Wallet size={20} color={Colors.success} />
      </View>
      <View style={styles.incomeContent}>
        <Text style={styles.incomeDescription}>{item.description}</Text>
        <View style={styles.incomeMeta}>
          <Calendar size={12} color={Colors.textTertiary} />
          <Text style={styles.incomeDate}>{formatDateShort(item.date)}</Text>
        </View>
      </View>
      <View style={styles.incomeRight}>
        <Text style={styles.incomeAmount}>{formatCurrency(item.amount)}</Text>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push({ pathname: '/add-income', params: { editId: item.id, amount: item.amount.toString(), description: item.description, date: item.date } })}
          >
            <Pencil size={16} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id, item.description)}
          >
            <Trash2 size={16} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Income Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 24,
            maxWidth: isWideScreen ? 960 : '100%',
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Income This Month</Text>
          <Text style={styles.summaryValue}>{formatCurrency(monthlyIncome)}</Text>
        </View>

        <View style={styles.addButtonContainer}>
          <PrimaryButton
            title="Add New Income"
            onPress={() => router.push('/add-income')}
          />
        </View>

        <Text style={styles.sectionTitle}>Income History</Text>

        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : incomes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Wallet size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No income entries yet</Text>
            <Text style={styles.emptySubtext}>Add your income to track savings</Text>
          </View>
        ) : (
          <FlatList
            data={incomes}
            renderItem={renderIncomeItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  summaryLabel: {
    ...Typography.body2,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  summaryValue: {
    ...Typography.h1,
    color: Colors.success,
  },
  addButtonContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  incomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  incomeIcon: {
    width: 40,
    height: 40,
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
    ...Typography.body1,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  incomeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginLeft: Spacing.xs,
  },
  incomeRight: {
    alignItems: 'flex-end',
  },
  incomeAmount: {
    ...Typography.body1,
    fontWeight: '700',
    color: Colors.success,
    marginBottom: Spacing.xs,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
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
  },
});
