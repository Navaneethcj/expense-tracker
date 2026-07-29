import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Calendar } from 'lucide-react-native';
import { Header, InputField, CategoryChip, PrimaryButton } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { CATEGORIES } from '@/src/constants/categories';
import { Expense } from '@/src/types';
import { getExpenses, saveExpense, updateExpense } from '@/src/storage';
import { generateId } from '@/src/utils';

interface FormErrors {
  amount?: string;
  category?: string;
  description?: string;
}

export default function AddExpenseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ editId?: string; amount?: string; category?: string; description?: string; date?: string }>();

  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(params.editId);

  useEffect(() => {
    const editId = Array.isArray(params.editId) ? params.editId[0] : params.editId;
    if (!editId) return;

    const loadExpense = async () => {
      const expenses = await getExpenses();
      const existingExpense = expenses.find((item) => item.id === editId);
      if (existingExpense) {
        setAmount(existingExpense.amount.toString());
        setSelectedCategory(existingExpense.category);
        setDescription(existingExpense.description);
        setDate(existingExpense.date);
      }
    };

    loadExpense();
  }, [params.editId]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be greater than zero';
      }
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const expenseData: Expense = {
        id: isEditing ? (Array.isArray(params.editId) ? params.editId[0] : params.editId) || generateId() : generateId(),
        amount: parseFloat(amount),
        category: selectedCategory!,
        description: description.trim(),
        date: date,
        createdAt: new Date().toISOString(),
      };

      if (isEditing) {
        await updateExpense(expenseData.id, expenseData);
      } else {
        await saveExpense(expenseData);
      }
      router.back();
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (dateString: string): string => {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Edit Expense' : 'Add Expense'}
        rightComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.currencySymbol}>₹</Text>
            <View style={styles.amountInputField}>
              <InputField
                label=""
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                keyboardType="numeric"
                error={errors.amount}
              />
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoriesContainer}>
            {CATEGORIES.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.name}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                color={category.color}
              />
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>

        <View style={styles.formSection}>
          <InputField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description..."
            multiline={true}
            error={errors.description}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionLabel}>Date</Text>
          <TouchableOpacity style={styles.datePicker} activeOpacity={0.7}>
            <Calendar size={20} color={Colors.primary} style={styles.dateIcon} />
            <Text style={styles.dateText}>{formatDateDisplay(date)}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isEditing ? 'Save Changes' : 'Save Expense'}
            onPress={handleSave}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  formSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.body2,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    ...Typography.h1,
    color: Colors.text,
    marginRight: Spacing.sm,
  },
  amountInputField: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: Spacing.sm,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateIcon: {
    marginRight: Spacing.md,
  },
  dateText: {
    ...Typography.body1,
    color: Colors.text,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
