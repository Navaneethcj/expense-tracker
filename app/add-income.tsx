import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Wallet } from 'lucide-react-native';
import { Header, InputField, PrimaryButton } from '@/src/components';
import { Colors, Typography, Spacing, BorderRadius } from '@/src/theme';
import { IncomeEntry } from '@/src/types';
import { getIncomes, saveIncome, updateIncome } from '@/src/storage';
import { generateId } from '@/src/utils';

export default function AddIncomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ editId?: string; amount?: string; description?: string; date?: string }>();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<{ amount?: string; description?: string }>({});
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(params.editId);

  useEffect(() => {
    const editId = Array.isArray(params.editId) ? params.editId[0] : params.editId;
    if (!editId) return;

    const loadIncome = async () => {
      const incomes = await getIncomes();
      const existingIncome = incomes.find((item) => item.id === editId);
      if (existingIncome) {
        setAmount(existingIncome.amount.toString());
        setDescription(existingIncome.description);
      }
    };

    loadIncome();
  }, [params.editId]);

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; description?: string } = {};

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be greater than zero';
      }
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
      const incomeData: IncomeEntry = {
        id: isEditing ? (Array.isArray(params.editId) ? params.editId[0] : params.editId) || generateId() : generateId(),
        amount: parseFloat(amount),
        description: description.trim(),
        date: date,
        createdAt: new Date().toISOString(),
      };

      if (isEditing) {
        await updateIncome(incomeData.id, incomeData);
      } else {
        await saveIncome(incomeData);
      }
      router.back();
    } catch (error) {
      console.error('Error saving income:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isEditing ? 'Edit Income' : 'Add Income'}
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
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Wallet size={32} color={Colors.success} />
          </View>
          <Text style={styles.instruction}>Add your income for this month</Text>
        </View>

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
          <InputField
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="e.g., Salary, Freelance, Bonus..."
            error={errors.description}
          />
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={isEditing ? 'Save Changes' : 'Add Income'}
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    marginTop: Spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  instruction: {
    ...Typography.body1,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
